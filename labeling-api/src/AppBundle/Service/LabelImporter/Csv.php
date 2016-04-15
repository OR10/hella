<?php

namespace AppBundle\Service\LabelImporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\Service\ProjectExporter\Exception;

class Csv implements Service\LabelImporter
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var array
     */
    private $dataIdToDatabaseIdMapping;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Service\TaskIncomplete
     */
    private $taskIncompleteService;

    /**
     * Csv constructor.
     * @param Facade\Project $projectFacade
     * @param Facade\LabeledThing $labeledThingFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Service\TaskIncomplete $taskIncompleteService
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Service\TaskIncomplete $taskIncompleteService
    ) {
        $this->projectFacade = $projectFacade;
        $this->labeledThingFacade = $labeledThingFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->taskIncompleteService = $taskIncompleteService;
    }

    /**
     * Import Labels for a given Project
     *
     * @param Model\Project $project
     * @param array $labelData
     * @return mixed
     */
    public function importLabels(Model\Project $project, array $labelData)
    {
        $tasks = $this->projectFacade->getTasksByProject($project);

        foreach($labelData as $label) {
            $task         = $this->findTaskForInstructionAndFrame($tasks, $label['label_class'], $label['frame_number']);
            $labeledThing = $this->getLabeledThing($task, $label['id'], $label['frame_number']);
            $shape        = $this->getShape(
                $task,
                $label['position_x'],
                $label['position_y'],
                $label['width'],
                $label['height']
            );

            $labeledThingInFrame = new Model\LabeledThingInFrame(
                $labeledThing,
                array_search(
                    $label['frame_number'],
                    $task->getFrameNumberMapping()
                ),
                $this->getClasses($task, $label['occlusion'], $label['truncation'], $label['direction'])
            );
            $labeledThingInFrame->setShapesAsObjects(array($shape));

            $labeledThingInFrame->setIncomplete(
                $this->taskIncompleteService->isLabeledThingInFrameIncomplete($labeledThingInFrame)
            );
            $this->labeledThingInFrameFacade->save($labeledThingInFrame);

            $labeledThing->setIncomplete(
                $this->taskIncompleteService->isLabeledThingIncomplete($labeledThing)
            );
            $this->labeledThingFacade->save($labeledThing);
            $this->taskIncompleteService->revalideLabeledThingInFrameIncompleteStatus($labeledThing, $labeledThingInFrame);
        }
    }

    /**
     * @param Model\LabelingTask $task
     * @param $occlusion
     * @param $truncation
     * @param $direction
     * @return array
     */
    private function getClasses(
        Model\LabelingTask $task,
        $occlusion,
        $truncation,
        $direction
    ) {
        switch ($task->getDrawingTool()) {
            case 'rectangle':
            case 'pedestrian':
                return array(
                    sprintf('occlusion-%s', $occlusion),
                    sprintf('truncation-%s', $truncation),
                    sprintf('direction-%s', $direction),
                );
            break;
            case 'ignore':
                return array(
                    sprintf('occlusion-%s', $occlusion),
                    sprintf('truncation-%s', $truncation),
                );
                break;
        }
    }

    /**
     * @param Model\LabelingTask $task
     * @param $x
     * @param $y
     * @param $width
     * @param $height
     * @return Model\Shapes\Rectangle
     */
    private function getShape(Model\LabelingTask $task, $x, $y, $width, $height)
    {
        switch ($task->getDrawingTool()) {
            case 'rectangle':
            case 'ignore':
                return new Model\Shapes\Rectangle(
                    $this->getUuid(),
                    $x,
                    $y,
                    $x + $width,
                    $y + $height
                );
                break;
            case 'pedestrian':
                return new Model\Shapes\Pedestrian(
                    $this->getUuid(),
                    round($x + ($width/2)),
                    round($y),
                    round($x + ($width/2)),
                    round($y + $height)
                );
                break;
        }
    }

    /**
     * @param Model\LabelingTask $task
     * @param $dataId
     * @param $frameNumber
     * @return mixed
     */
    private function getLabeledThing(Model\LabelingTask $task, $dataId, $frameNumber)
    {
        $frameIndexNumber = array_search($frameNumber, $task->getFrameNumberMapping());
        if (!isset($this->dataIdToDatabaseIdMapping[$task->getId()][$dataId])) {
            $labeledThing = new Model\LabeledThing($task, rand(1, 50));
            $frameIndexRange = new Model\FrameIndexRange($frameIndexNumber, $frameIndexNumber);
            $labeledThing->setFrameRange($frameIndexRange);
            $this->labeledThingFacade->save($labeledThing);
            $this->dataIdToDatabaseIdMapping[$task->getId()][$dataId] = $this->labeledThingFacade->save($labeledThing);
        }else{
            /** @var Model\LabeledThing $labeledThing */
            $labeledThing = $this->dataIdToDatabaseIdMapping[$task->getId()][$dataId];
            $frameIndexRange = $labeledThing->getFrameRange();
            if ($frameIndexNumber < $frameIndexRange->getStartFrameIndex()) {
                $frameIndexRange->startFrameIndex = $frameIndexNumber;
            }
            if ($frameIndexNumber > $frameIndexRange->getEndFrameIndex()) {
                $frameIndexRange->endFrameIndex = $frameIndexNumber;
            }
            $labeledThing->setFrameRange($frameIndexRange);
            $this->labeledThingFacade->save($labeledThing);
        }

        return $this->dataIdToDatabaseIdMapping[$task->getId()][$dataId];
    }

    /**
     * @param $tasks
     * @param $instruction
     * @param $frameNumber
     * @return Model\LabelingTask
     * @throws \Exception
     */
    private function findTaskForInstructionAndFrame($tasks, $instruction, $frameNumber)
    {
        $possibleTasks = array_filter($tasks, function(Model\LabelingTask $task) use ($instruction, $frameNumber) {
            if ($task->getLabelInstruction() === $instruction &&
                in_array($frameNumber, $task->getFrameNumberMapping())) {
                return true;
            }

            return false;
        });

        if (count($possibleTasks) === 0) {
            throw new \Exception(
                sprintf(
                    'No labeling task for frame %s and instruction %s found!',
                    $frameNumber,
                    $instruction
                )
            );
        }

        if (count($possibleTasks) > 1) {
            throw new \Exception(
                sprintf(
                    'More than once labeling task for frame %s and instruction %s found!',
                    $frameNumber,
                    $instruction
                )
            );
        }

        return reset($possibleTasks);
    }

    /**
     * @return mixed
     */
    private function getUuid() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',

            // 32 bits for "time_low"
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),

            // 16 bits for "time_mid"
            mt_rand(0, 0xffff),

            // 16 bits for "time_hi_and_version",
            // four most significant bits holds version number 4
            mt_rand(0, 0x0fff) | 0x4000,

            // 16 bits, 8 bits for "clk_seq_hi_res",
            // 8 bits for "clk_seq_low",
            // two most significant bits holds zero and one for variant DCE1.1
            mt_rand(0, 0x3fff) | 0x8000,

            // 48 bits for "node"
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}