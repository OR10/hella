<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;
use AnnoStationBundle\Service\ProjectImporter\Facade;
use AppBundle\Model;

class ThingImporter extends WorkerPoolBundle\JobInstruction
{
    /**
     * @var Service\TaskIncomplete
     */
    private $taskIncompleteService;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;
    /**
     * @var Facade\Project
     */
    private $project;

    /**
     * @var Model\LabelingTask[]
     */
    private $tasks;

    /**
     * ThingImporter constructor.
     *
     * @param Service\TaskIncomplete     $taskIncompleteService
     * @param Facade\LabeledThing        $labeledThingFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\Project             $project
     */
    public function __construct(
        Service\TaskIncomplete $taskIncompleteService,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\Project $project
    ) {
        $this->taskIncompleteService     = $taskIncompleteService;
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->project                   = $project;
    }

    /**
     * @param Job                        $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    protected function runJob(Job $job, Logger\Facade\LoggerFacade $logger)
    {
        $xmlImport = new \DOMDocument();
        $xmlImport->load($job->getXmlImportFilePath());

        $xpath = new \DOMXPath($xmlImport);
        $xpath->registerNamespace('x', "http://weblabel.hella-aglaia.com/schema/export");

        $this->tasks   = $job->getTasks();
        $videoElements = $xpath->query('/x:export/x:video');
        foreach ($videoElements as $videoElement) {
            $things = $xpath->query('./x:thing', $videoElement);
            /** @var \DOMElement $thing */
            foreach ($things as $thing) {
                $labeledThing = $this->getLabeledThing($thing);
                $values       = $this->getValues($xpath->query('./x:value', $thing));
                $this->saveLabeledThingInFrame(
                    $xpath,
                    $xpath->query('./x:shape', $thing),
                    $labeledThing,
                    $values,
                    $thing->getAttribute('type')
                );
            }
        }
    }

    /**
     * @param \DOMElement $xpath
     *
     * @return Model\LabeledThing|null
     */
    private function getLabeledThing(\DOMElement $xpath)
    {
        $originalId = $xpath->getAttribute('id');
        $start      = $xpath->getAttribute('start');
        $end        = $xpath->getAttribute('end');

        if ($this->tasks[$start]->getId() === $this->tasks[$end]->getId()) {
            $task         = $this->tasks[$start];
            $frameMapping = array_flip($task->getFrameNumberMapping());
            $labeledThing = new Model\LabeledThing($task, $xpath->getAttribute('line-color'));
            $labeledThing->setOriginalId($originalId);
            $labeledThing->setFrameRange(
                new Model\FrameIndexRange(
                    $frameMapping[$start],
                    $frameMapping[$end]
                )
            );

            $this->labeledThingFacade->save($labeledThing);

            return $labeledThing;
        }

        return null;
    }

    /**
     * @param \DOMXPath          $xpath
     * @param \DOMNodeList        $shapeElements
     * @param Model\LabeledThing $labeledThing
     * @param                    $values
     * @param                    $identifier
     */
    private function saveLabeledThingInFrame(
        \DOMXPath $xpath,
        \DOMNodeList $shapeElements,
        Model\LabeledThing $labeledThing,
        $values,
        $identifier
    ) {
        /** @var \DOMElement $shapeElement */
        foreach ($shapeElements as $shapeElement) {
            $start = $shapeElement->getAttribute('start');
            $end   = $shapeElement->getAttribute('end');
            if ($this->tasks[$start]->getId() === $this->tasks[$end]->getId()) {
                /** @var Model\LabelingTask $task */
                $task         = $this->tasks[$start];
                $frameMapping = array_flip($task->getFrameNumberMapping());

                $projectVideoSettings = $this->project->find($task->getProjectId())->getTaskVideoSettings();
                $frameSkip            = (int) $projectVideoSettings['frameSkip'];
                $frameRange           = range(
                    $start,
                    $end,
                    $frameSkip
                );
                foreach ($frameRange as $frame) {
                    $shapes              = $this->getShapes(
                        $xpath,
                        $xpath->query('./x:pedestrian|./x:rectangle|./x:polygon|./x:cuboid', $shapeElement),
                        $shapeElement->getAttribute('id')
                    );
                    $labeledThingInFrame = new Model\LabeledThingInFrame(
                        $labeledThing,
                        $frameMapping[$frame],
                        isset($values[$frame]) ? $values[$frame] : [],
                        $shapes
                    );
                    $labeledThingInFrame->setIdentifierName($identifier);

                    $labeledThingInFrame->setIncomplete(
                        $this->taskIncompleteService->isLabeledThingInFrameIncomplete($labeledThingInFrame)
                    );
                    $this->taskIncompleteService->revalideLabeledThingInFrameIncompleteStatus(
                        $labeledThing,
                        $labeledThingInFrame
                    );
                    $this->labeledThingInFrameFacade->save($labeledThingInFrame);

                    $labeledThing->setIncomplete(
                        $this->taskIncompleteService->isLabeledThingIncomplete($labeledThing)
                    );
                    $this->labeledThingFacade->save($labeledThing);
                }
            }
        }
    }

    /**
     * @param \DOMXPath $xpath
     * @param           $shapeElements
     * @param           $id
     *
     * @return array
     */
    private function getShapes(\DOMXPath $xpath, $shapeElements, $id)
    {
        $shapes = [];
        foreach ($shapeElements as $shapeElement) {
            switch ($shapeElement->nodeName) {
                case 'pedestrian':
                    $shapes[] = new Model\Shapes\Pedestrian(
                        $id,
                        (float) $xpath->query('x:top-center', $shapeElement)->item(0)->getAttribute('x'),
                        (float) $xpath->query('x:top-center', $shapeElement)->item(0)->getAttribute('y'),
                        (float) $xpath->query('x:bottom-center', $shapeElement)->item(0)->getAttribute('x'),
                        (float) $xpath->query('x:bottom-center', $shapeElement)->item(0)->getAttribute('y')
                    );
                    break;
                case 'rectangle':
                    $shapes[] = new Model\Shapes\Rectangle(
                        $id,
                        (float) $xpath->query('x:top-left', $shapeElement)->item(0)->getAttribute('x'),
                        (float) $xpath->query('x:top-left', $shapeElement)->item(0)->getAttribute('y'),
                        (float) $xpath->query('x:bottom-right', $shapeElement)->item(0)->getAttribute('x'),
                        (float) $xpath->query('x:bottom-right', $shapeElement)->item(0)->getAttribute('y')
                    );
                    break;
                case 'polygon':
                    $points = [];
                    /** @var \DOMElement $point */
                    foreach ($xpath->query('x:point', $shapeElement) as $point) {
                        $points[] = [
                            'x' => (float) $point->getAttribute('x'),
                            'y' => (float) $point->getAttribute('y'),
                        ];
                    }
                    $shapes[] = new Model\Shapes\Polygon(
                        $id,
                        $points
                    );
                    break;
                case 'cuboid':
                    $topLeftFront     = null;
                    $topRightFront    = null;
                    $bottomRightFront = null;
                    $bottomLeftFront  = null;
                    $topLeftBack      = null;
                    $topRightBack     = null;
                    $bottomRightBack  = null;
                    $bottomLeftBack   = null;

                    if ($xpath->query('x:top-left-front', $shapeElement)->length > 0) {
                        $topLeftFront = [
                            (float) $xpath->query('x:top-left-front', $shapeElement)->item(0)->getAttribute('x'),
                            (float) $xpath->query('x:top-left-front', $shapeElement)->item(0)->getAttribute('y'),
                            (float) $xpath->query('x:top-left-front', $shapeElement)->item(0)->getAttribute('z'),
                        ];
                    }

                    if ($xpath->query('x:top-right-front', $shapeElement)->length > 0) {
                        $topRightFront = [
                            (float) $xpath->query('x:top-right-front', $shapeElement)->item(0)->getAttribute('x'),
                            (float) $xpath->query('x:top-right-front', $shapeElement)->item(0)->getAttribute('y'),
                            (float) $xpath->query('x:top-right-front', $shapeElement)->item(0)->getAttribute('z'),
                        ];
                    }

                    if ($xpath->query('x:bottom-right-front', $shapeElement)->length > 0) {
                        $bottomRightFront = [
                            (float) $xpath->query('x:bottom-right-front', $shapeElement)->item(0)->getAttribute('x'),
                            (float) $xpath->query('x:bottom-right-front', $shapeElement)->item(0)->getAttribute('y'),
                            (float) $xpath->query('x:bottom-right-front', $shapeElement)->item(0)->getAttribute('z'),
                        ];
                    }

                    if ($xpath->query('x:bottom-left-front', $shapeElement)->length > 0) {
                        $bottomLeftFront = [
                            (float) $xpath->query('x:bottom-left-front', $shapeElement)->item(0)->getAttribute('x'),
                            (float) $xpath->query('x:bottom-left-front', $shapeElement)->item(0)->getAttribute('y'),
                            (float) $xpath->query('x:bottom-left-front', $shapeElement)->item(0)->getAttribute('z'),
                        ];
                    }

                    if ($xpath->query('x:top-left-back', $shapeElement)->length > 0) {
                        $topLeftBack = [
                            (float) $xpath->query('x:top-left-back', $shapeElement)->item(0)->getAttribute('x'),
                            (float) $xpath->query('x:top-left-back', $shapeElement)->item(0)->getAttribute('y'),
                            (float) $xpath->query('x:top-left-back', $shapeElement)->item(0)->getAttribute('z'),
                        ];
                    }

                    if ($xpath->query('x:top-right-back', $shapeElement)->length > 0) {
                        $topRightBack = [
                            (float) $xpath->query('x:top-right-back', $shapeElement)->item(0)->getAttribute('x'),
                            (float) $xpath->query('x:top-right-back', $shapeElement)->item(0)->getAttribute('y'),
                            (float) $xpath->query('x:top-right-back', $shapeElement)->item(0)->getAttribute('z'),
                        ];
                    }

                    if ($xpath->query('x:bottom-right-back', $shapeElement)->length > 0) {
                        $bottomRightBack = [
                            (float) $xpath->query('x:bottom-right-back', $shapeElement)->item(0)->getAttribute('x'),
                            (float) $xpath->query('x:bottom-right-back', $shapeElement)->item(0)->getAttribute('y'),
                            (float) $xpath->query('x:bottom-right-back', $shapeElement)->item(0)->getAttribute('z'),
                        ];
                    }

                    if ($xpath->query('x:bottom-left-back', $shapeElement)->length > 0) {
                        $bottomLeftBack = [
                            (float) $xpath->query('x:bottom-left-back', $shapeElement)->item(0)->getAttribute('x'),
                            (float) $xpath->query('x:bottom-left-back', $shapeElement)->item(0)->getAttribute('y'),
                            (float) $xpath->query('x:bottom-left-back', $shapeElement)->item(0)->getAttribute('z'),
                        ];
                    }

                    $shapes[] = new Model\Shapes\Cuboid3d(
                        $id,
                        $topLeftFront,
                        $topRightFront,
                        $bottomRightFront,
                        $bottomLeftFront,
                        $topLeftBack,
                        $topRightBack,
                        $bottomRightBack,
                        $bottomLeftBack
                    );
                    break;
            }
        }

        $shapes = array_map(
            function (Model\Shape $shape) {
                return $shape->toArray();
            },
            $shapes
        );

        return $shapes;
    }

    /**
     * @param $valueElements
     *
     * @return array
     */
    private function getValues($valueElements)
    {
        $values = [];
        /** @var \DOMElement $valueElement */
        foreach ($valueElements as $valueElement) {
            $frameNumberRange = range($valueElement->getAttribute('start'), $valueElement->getAttribute('end'));
            foreach ($frameNumberRange as $frameNumber) {
                $values[$frameNumber][] = $valueElement->getAttribute('id');
            }
        }

        return $values;
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\ThingImporter;
    }
}
