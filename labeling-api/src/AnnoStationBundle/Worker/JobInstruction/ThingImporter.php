<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade as AnnoStationFacade;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;
use AnnoStationBundle\Service\ProjectImporter\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use Doctrine\ODM\CouchDB;
use AnnoStationBundle\Helper;

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
     * @var array
     */
    private $taskIds;

    /**
     * @var AnnoStationFacade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var array
     */
    private $allowedShapes = [
        './x:pedestrian',
        './x:rectangle',
        './x:polygon',
        './x:polyline',
        './x:cuboid',
        './x:point',
    ];
    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacade;

    /**
     * @var Facade\LabeledThingGroupInFrame
     */
    private $labeledThingGroupInFrameFacade;

    /**
     * @var AnnoStationFacade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var array
     */
    private $labeledThingGroupCache = [];

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * ThingImporter constructor.
     *
     * @param Service\TaskIncomplete          $taskIncompleteService
     * @param Facade\LabeledThing             $labeledThingFacade
     * @param Facade\LabeledThingInFrame      $labeledThingInFrameFacade
     * @param Facade\LabeledFrame             $labeledFrameFacade
     * @param Facade\Project                  $project
     * @param Facade\LabeledThingGroup        $labeledThingGroupFacade
     * @param Facade\LabeledThingGroupInFrame $labeledThingGroupInFrameFacade
     * @param AnnoStationFacade\TaskConfiguration        $taskConfigurationFacade
     * @param AnnoStationFacade\LabelingTask  $labelingTaskFacade
     * @param CouchDB\DocumentManager         $documentManager
     */
    public function __construct(
        Service\TaskIncomplete $taskIncompleteService,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledFrame $labeledFrameFacade,
        Facade\Project $project,
        Facade\LabeledThingGroup $labeledThingGroupFacade,
        Facade\LabeledThingGroupInFrame $labeledThingGroupInFrameFacade,
        AnnoStationFacade\TaskConfiguration $taskConfigurationFacade,
        AnnoStationFacade\LabelingTask $labelingTaskFacade,
        CouchDB\DocumentManager $documentManager
    ) {
        $this->taskIncompleteService          = $taskIncompleteService;
        $this->labeledThingFacade             = $labeledThingFacade;
        $this->labeledThingInFrameFacade      = $labeledThingInFrameFacade;
        $this->labeledFrameFacade             = $labeledFrameFacade;
        $this->project                        = $project;
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->labeledThingGroupFacade        = $labeledThingGroupFacade;
        $this->taskConfigurationFacade        = $taskConfigurationFacade;
        $this->documentManager                = $documentManager;
        $this->labeledThingGroupInFrameFacade = $labeledThingGroupInFrameFacade;
    }

    /**
     * @param Job                        $job
     * @param Logger\Facade\LoggerFacade $logger
     */
    protected function runJob(Job $job, Logger\Facade\LoggerFacade $logger)
    {
        $xmlImport = new \DOMDocument();
        $xmlImport->loadXML($this->beautifyXml($job->getXmlImportFilePath()));

        $xpath = new \DOMXPath($xmlImport);
        $xpath->registerNamespace('x', "http://weblabel.hella-aglaia.com/schema/export");

        $this->taskIds = $job->getTaskIds();
        $videoElements = $xpath->query('/x:export/x:video');
        foreach ($videoElements as $videoElement) {
            $groups = $this->getLabeledThingGroupsReferences($xpath, $xpath->query('./x:group', $videoElement));
            $things = $xpath->query('./x:thing', $videoElement);
            /** @var \DOMElement $thing */
            foreach ($things as $thing) {
                $labeledThing = $this->getLabeledThing($thing, $xpath, $groups);
                if ($labeledThing instanceof Model\LabeledThing) {
                    $values = $this->getValues($xpath->query('./x:value', $thing));
                    $this->saveLabeledThingInFrame(
                        $xpath,
                        $xpath->query('./x:shape', $thing),
                        $labeledThing,
                        $values,
                        $thing->getAttribute('type')
                    );
                }
            }
            $frameLabeling = $xpath->query('./x:frame-labeling', $videoElement);
            if ($frameLabeling->length > 0) {
                $this->saveFrameLabeling($xpath, $frameLabeling->item(0));
            }
        }

        $this->markImportAsComplete();
    }

    /**
     * @param \DOMXPath    $xpath
     * @param \DOMNodeList $groupsElement
     *
     * @return array
     */
    private function getLabeledThingGroupsReferences(\DOMXPath $xpath, \DOMNodeList $groupsElement)
    {
        $groups = [];
        foreach ($groupsElement as $groupElement) {
            $originalId          = $groupElement->getAttribute('id');
            $groups[$originalId] = [
                'lineColor'      => $groupElement->getAttribute('line-color'),
                'identifierName' => $groupElement->getAttribute('type'),
            ];

            $createdByUserId      = null;
            $createdByUserIdQuery = $xpath->query('./x:created-by', $groupElement);
            if ($createdByUserIdQuery->length === 1) {
                $groups[$originalId]['createdByUserId'] = $createdByUserIdQuery->item(0)->nodeValue;
            }

            $createdAt      = null;
            $createdAtQuery = $xpath->query('./x:created-at', $groupElement);
            if ($createdAtQuery->length === 1) {
                $groups[$originalId]['createdAt'] = new \DateTime($createdAtQuery->item(0)->nodeValue);
            }


            $values = $xpath->query('./x:value', $groupElement);
            foreach ($values as $value) {
                $id = $value->getAttribute('id');
                $startFrame = $value->getAttribute('start');
                $groups[$originalId]['values'][$startFrame][] = $id;
            }
        }

        return $groups;
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $originalId
     * @param                    $groupReferences
     *
     * @return mixed
     */
    private function getLabeledThingGroup(Model\LabelingTask $task, $originalId, $groupReferences)
    {
        $labeledThingGroupByTaskIdAndOriginalId = $this->labeledThingGroupFacade->getLabeledThingGroupByTaskIdAndOriginalId(
            $task,
            $originalId
        );
        if ($labeledThingGroupByTaskIdAndOriginalId !== null) {
            $this->labeledThingGroupCache[$task->getId()][$originalId] = $labeledThingGroupByTaskIdAndOriginalId;
        }

        if (!isset($this->labeledThingGroupCache[$task->getId()][$originalId])) {
            $createdByUserId = null;
            if (isset($groupReferences[$originalId]['createdByUserId'])) {
                $createdByUserId = $groupReferences[$originalId]['createdByUserId'];
            }
            $labeledThingGroup = new AnnoStationBundleModel\LabeledThingGroup(
                $task,
                $groupReferences[$originalId]['lineColor'],
                $groupReferences[$originalId]['identifierName'],
                [],
                $createdByUserId
            );
            $labeledThingGroup->setOriginalId($originalId);

            if (isset($groupReferences[$originalId]['createdAt'])) {
                $labeledThingGroup->setCreatedAt($groupReferences[$originalId]['createdAt']);
            }

            $this->labeledThingGroupFacade->save($labeledThingGroup);

            if (isset($groupReferences[$originalId]['values'])) {
                foreach ($groupReferences[$originalId]['values'] as $startFrame => $classes) {
                    $classes = array_values(
                        array_filter(
                            $classes,
                            function ($class) use ($task) {
                                return $this->isGroupClassTypeValid($task, $class);
                            }
                        )
                    );
                    $labeledThingGroupInFrame = new AnnoStationBundleModel\LabeledThingGroupInFrame(
                        $task,
                        $labeledThingGroup,
                        array_search($startFrame, $task->getFrameNumberMapping()),
                        $classes
                    );

                    $labeledThingGroupInFrame->setIncomplete(
                        $this->taskIncompleteService->isLabeledThingGroupInFrameIncomplete($labeledThingGroupInFrame)
                    );
                    $this->labeledThingGroupInFrameFacade->save($labeledThingGroupInFrame);
                }
            }

            $labeledThingGroup->setIncomplete($this->taskIncompleteService->isLabeledThingGroupIncomplete($labeledThingGroup));
            $this->labeledThingGroupFacade->save($labeledThingGroup);

            $this->labeledThingGroupCache[$task->getId()][$originalId] = $labeledThingGroup;
        }

        return $this->labeledThingGroupCache[$task->getId()][$originalId];
    }

    /**
     * @param \DOMElement $thingElement
     * @param             $groupReferences
     *
     * @return Model\LabeledThing|null
     */
    private function getLabeledThing(\DOMElement $thingElement, \DOMXPath $xpath, $groupReferences)
    {
        $originalId = $thingElement->getAttribute('id');
        $start      = $thingElement->getAttribute('start');
        $end        = $thingElement->getAttribute('end');
        $identifier = $thingElement->getAttribute('type');

        if ($this->isStartAndEndTheSameTask($start, $end)) {
            $task         = $this->labelingTaskFacade->find($this->taskIds[$start]);

            if (!$this->isThingIdentifierTypeValid($task, $identifier)) {
                return null;
            }

            $frameMapping = array_flip($task->getFrameNumberMapping());
            if ($this->isLabeledThingInFrameElementAlreadyImported($task, $thingElement)) {
                $labeledThing = $this->labeledThingFacade->getLabeledThingForImportedLineNo($task, $thingElement->getLineNo());
            } else {
                $groups = $xpath->query('./x:references/x:group', $thingElement);

                $createdByUserId      = null;
                $createdByUserIdQuery = $xpath->query('./x:created-by', $thingElement);
                if ($createdByUserIdQuery->length === 1) {
                    $createdByUserId = $createdByUserIdQuery->item(0)->nodeValue;
                }

                $createdAt      = null;
                $createdAtQuery = $xpath->query('./x:created-at', $thingElement);
                if ($createdAtQuery->length === 1) {
                    $createdAt = new \DateTime($createdAtQuery->item(0)->nodeValue);
                }

                $labeledThing = new Model\LabeledThing(
                    $task,
                    $thingElement->getAttribute('line-color'),
                    $createdByUserId
                );
                $labeledThing->setImportLineNo($thingElement->getLineNo());
                $labeledThing->setOriginalId($originalId);
                $labeledThing->setFrameRange(
                    new Model\FrameIndexRange(
                        $frameMapping[$start],
                        $frameMapping[$end]
                    )
                );
                $labeledThing->setCreatedAt($createdAt);

                $groupIds = [];
                foreach ($groups as $group) {
                    $originalLabeledThingGroupId = $group->getAttribute('ref');
                    if ($this->isGroupIdentifierTypeValid($task, $groupReferences[$originalLabeledThingGroupId]['identifierName'])) {
                        $labeledThingGroup = $this->getLabeledThingGroup(
                            $task,
                            $originalLabeledThingGroupId,
                            $groupReferences
                        );
                        $groupIds[]        = $labeledThingGroup->getId();
                    }
                }
                $labeledThing->setGroupIds($groupIds);

                $this->labeledThingFacade->save($labeledThing);
            }

            return $labeledThing;
        }

        return null;
    }

    /**
     * @param \DOMXPath          $xpath
     * @param \DOMNodeList       $shapeElements
     * @param Model\LabeledThing $labeledThing
     * @param                    $classes
     * @param                    $identifier
     */
    private function saveLabeledThingInFrame(
        \DOMXPath $xpath,
        \DOMNodeList $shapeElements,
        Model\LabeledThing $labeledThing,
        $classes,
        $identifier
    ) {
        /** @var \DOMElement $shapeElement */
        foreach ($shapeElements as $shapeElement) {
            $start = $shapeElement->getAttribute('start');
            $end   = $shapeElement->getAttribute('end');
            if ($this->isStartAndEndTheSameTask($start, $end)) {
                /** @var Model\LabelingTask $task */
                $task         = $this->labelingTaskFacade->find($this->taskIds[$start]);
                $frameMapping = array_flip($task->getFrameNumberMapping());

                $projectVideoSettings = $this->project->find($task->getProjectId())->getTaskVideoSettings();
                $frameSkip            = (int) $projectVideoSettings['frameSkip'];
                $frameRange           = range(
                    $start,
                    $end,
                    $frameSkip
                );
                foreach ($frameRange as $frame) {
                    if (isset($classes[$frame])) {
                        $classes[$frame] = array_values(
                            array_filter(
                                $classes[$frame],
                                function ($class) use ($task) {
                                    return $this->isThingClassTypeValid($task, $class);
                                }
                            )
                        );
                    }

                    if ($this->isLabeledThingInFrameElementAlreadyImported($task, $shapeElement)) {
                        continue;
                    }
                    $shapes              = $this->getShapes(
                        $xpath,
                        $xpath->query(
                            implode('|', $this->allowedShapes),
                            $shapeElement
                        ),
                        $shapeElement->getAttribute('id')
                    );
                    $labeledThingInFrame = new Model\LabeledThingInFrame(
                        $labeledThing,
                        $frameMapping[$frame],
                        isset($classes[$frame]) ? $classes[$frame] : [],
                        $shapes
                    );
                    $labeledThingInFrame->setImportLineNo($shapeElement->getLineNo());
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
     * @param Model\LabelingTask $task
     * @param \DOMElement        $element
     *
     * @return bool
     */
    private function isLabeledThingInFrameElementAlreadyImported(Model\LabelingTask $task, \DOMElement $element)
    {
        $max = $this->labeledThingInFrameFacade->getMaxLabeledThingInFrameImportLineNoForTask($task);

        return $max >= $element->getLineNo();
    }

    /**
     * @param \DOMXPath   $xpath
     * @param \DOMElement $frameLabeling
     */
    private function saveFrameLabeling(\DOMXPath $xpath, \DOMElement $frameLabeling)
    {
        $classes              = $xpath->query('./x:value', $frameLabeling);
        $valuesByFrameNumber = [];
        foreach ($classes as $class) {
            $id    = $class->getAttribute('id');
            $start = $class->getAttribute('start');
            $end   = $class->getAttribute('end');
            foreach (range($start, $end) as $frameNumber) {
                $valuesByFrameNumber[$frameNumber][] = $id;
            }
        }
        $previousValues = [];

        foreach ($valuesByFrameNumber as $frameNumber => $classes) {
            $task       = $this->labelingTaskFacade->find($this->taskIds[$frameNumber]);
            $frameIndex = array_search($frameNumber, $task->getFrameNumberMapping());

            $classes = array_values(
                array_filter(
                    $classes,
                    function ($class) use ($task) {
                        return $this->isFrameClassTypeValid($task, $class);
                    }
                )
            );
            if (count(array_diff($classes, $previousValues)) === 0) {
                continue;
            }

            if ($frameIndex === false) {
                continue;
            }

            if (count($this->labeledFrameFacade->findBylabelingTask($task, $frameIndex)) > 0) {
                $previousValues = $classes;
                continue;
            }
            $labeledFrame = new Model\LabeledFrame($task, $frameIndex);
            $labeledFrame->setClasses($classes);
            $labeledFrame->setIncomplete($this->taskIncompleteService->isLabeledFrameIncomplete($labeledFrame));
            $this->labeledFrameFacade->save($labeledFrame);
            $previousValues = $classes;
        }
    }

    /**
     * @param string $start
     * @param string $end
     *
     * @return bool
     */
    private function isStartAndEndTheSameTask($start, $end)
    {
        return ($this->taskIds[$start] === $this->taskIds[$end]);
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
                case 'polyline':
                    $points = [];
                    /** @var \DOMElement $point */
                    foreach ($xpath->query('x:point', $shapeElement) as $point) {
                        $points[] = [
                            'x' => (float) $point->getAttribute('x'),
                            'y' => (float) $point->getAttribute('y'),
                        ];
                    }
                    $shapes[] = new Model\Shapes\Polyline(
                        $id,
                        $points
                    );
                    break;
                case 'point':
                    $shapes[] = new Model\Shapes\Point(
                        $id,
                        [
                            'x' => (float) $xpath->query('x:center', $shapeElement)->item(0)->getAttribute('x'),
                            'y' => (float) $xpath->query('x:center', $shapeElement)->item(0)->getAttribute('y'),
                        ]
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

    private function markImportAsComplete()
    {
        $this->documentManager->clear();
        foreach ($this->taskIds as $taskId) {
            $task = $this->labelingTaskFacade->find($taskId);
            $task->setLabelDataImportInProgress(false);
            $this->labelingTaskFacade->save($task);
        }
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $identifier
     *
     * @return bool
     */
    private function isThingIdentifierTypeValid(Model\LabelingTask $task, $identifier)
    {
        $requirementsXml = $this->taskConfigurationFacade->find($task->getTaskConfigurationId());

        $helper = new Helper\TaskConfiguration\RequirementsXml();

        return in_array($identifier, $helper->getValidThingIdentifiers($requirementsXml));
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $class
     *
     * @return bool
     */
    private function isThingClassTypeValid(Model\LabelingTask $task, $class)
    {
        $requirementsXml = $this->taskConfigurationFacade->find($task->getTaskConfigurationId());

        $helper = new Helper\TaskConfiguration\RequirementsXml();

        return in_array($class, $helper->getValidThingClasses($requirementsXml));
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $class
     *
     * @return bool
     */
    private function isFrameClassTypeValid(Model\LabelingTask $task, $class)
    {
        $requirementsXml = $this->taskConfigurationFacade->find($task->getTaskConfigurationId());

        $helper = new Helper\TaskConfiguration\RequirementsXml();

        return in_array($class, $helper->getValidFrameClasses($requirementsXml));
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $identifier
     *
     * @return bool
     */
    private function isGroupIdentifierTypeValid(Model\LabelingTask $task, $identifier)
    {
        $requirementsXml = $this->taskConfigurationFacade->find($task->getTaskConfigurationId());

        $helper = new Helper\TaskConfiguration\RequirementsXml();

        return in_array($identifier, $helper->getValidGroupIdentifiers($requirementsXml));
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $class
     *
     * @return bool
     */
    private function isGroupClassTypeValid(Model\LabelingTask $task, $class)
    {
        $requirementsXml = $this->taskConfigurationFacade->find($task->getTaskConfigurationId());

        $helper = new Helper\TaskConfiguration\RequirementsXml();

        return in_array($class, $helper->getValidGroupClasses($requirementsXml));
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

    /**
     * @param $xmlPath
     *
     * @return string
     */
    private function beautifyXml($xmlPath)
    {
        $xmlImport = new \DOMDocument();
        $xmlImport->formatOutput = true;
        $xmlImport->preserveWhiteSpace = false;
        $xmlImport->load($xmlPath);
        return $xmlImport->saveXML();
    }
}
