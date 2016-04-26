<?php

namespace AppBundle\Service\LabelImporter;

use AppBundle\Database\Facade;
use AppBundle\Helper\ProgressIndicator;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\Service\ProjectExporter\Exception;
use Symfony\Component\Console\Helper\ProgressBar;

class Csv implements Service\LabelImporter
{
    /**
     * @var array
     */
    private $dataIdToDatabaseIdMapping;

    /**
     * @var Facade\LabelingTask
     */
    private $taskFacade;

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
     * @var ProgressIndicator|null
     */
    private $progressIndicator;

    /**
     * Csv constructor.
     *
     * @param Facade\LabelingTask        $taskFacade
     * @param Facade\LabeledThing        $labeledThingFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Service\TaskIncomplete     $taskIncompleteService
     */
    public function __construct(
        Facade\LabelingTask $taskFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Service\TaskIncomplete $taskIncompleteService
    ) {
        $this->taskFacade                = $taskFacade;
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->taskIncompleteService     = $taskIncompleteService;

        $this->progressIndicator = null;
    }

    /**
     * Optionally set a progress indicator to inform about import status
     *
     * The progress indicator isn't required. If it is not set it will simply not be used for information callbacks.
     *
     * @param ProgressIndicator $progressIndicator
     */
    public function setProgressIndicator(ProgressIndicator $progressIndicator)
    {
        $this->progressIndicator = $progressIndicator;
    }

    /**
     * Import Labels using CSV data for existing Tasks
     *
     * @param Model\LabelingTask[] $tasks
     * @param array                $data
     *
     * @throws \Exception
     */
    public function importLabels(array $tasks, array $data)
    {
        if ($this->progressIndicator !== null) {
            $this->progressIndicator->start(count($data));
        }
        
        foreach ($data as $label) {
            $instruction  = $this->extractInstruction($label);
            $task         = $this->findTaskForInstructionAndFrame($tasks, $instruction, $label['frame_number']);
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
                $this->getClasses(
                    $task,
                    $label['occlusion'],
                    $label['truncation'],
                    $label['direction'],
                    $label['label_class']
                )
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
            $this->taskIncompleteService->revalideLabeledThingInFrameIncompleteStatus(
                $labeledThing,
                $labeledThingInFrame
            );
            
            if ($this->progressIndicator !== null) {
                $this->progressIndicator->advance();
            }
        }

        $this->markTasksAsWaiting($tasks);

        if ($this->progressIndicator !== null) {
            $this->progressIndicator->finish();
        }
    }

    /**
     * @param Model\LabelingTask[] $tasks
     */
    protected function markTasksAsWaiting(array $tasks)
    {
        foreach ($tasks as $task) {
            $task->setStatus(Model\LabelingTask::STATUS_WAITING);
            $this->taskFacade->save($task);
        }
    }

    /**
     * Generate proper class lists by looking at the different exported information columns
     *
     * A set of special values is allowed, which implies ignore this information, it is not present.
     * This set currently contains the following:
     *
     * - `-1`
     * - empty string
     *
     * @param Model\LabelingTask $task
     * @param                    $occlusion
     * @param                    $truncation
     * @param                    $direction
     * @param                    $labelClass
     *
     * @return array
     */
    protected function getClasses(
        Model\LabelingTask $task,
        $occlusion,
        $truncation,
        $direction,
        $labelClass
    ) {
        $emptyFieldValues = array(
            '-1',
            '',
        );

        $classes = array();

        switch ($task->getLabelInstruction()) {
            case Model\LabelingTask::INSTRUCTION_CYCLIST:
            case Model\LabelingTask::INSTRUCTION_PERSON:
                if (!in_array($occlusion, $emptyFieldValues, true)) {
                    $classes[] = sprintf('occlusion-%s', $occlusion);
                }
                if (!in_array($truncation, $emptyFieldValues, true)) {
                    $classes[] = sprintf('truncation-%s', $truncation);
                }
                if (!in_array($direction, $emptyFieldValues, true)) {
                    $classes[] = sprintf('direction-%s', $direction);
                }

                return $classes;
            case Model\LabelingTask::INSTRUCTION_IGNORE:
                preg_match('/^(ignore-(\w+))$/', $labelClass, $matches);

                return array(
                    sprintf('%s', $matches[2]),
                );
        }

        return array();
    }

    /**
     * @param Model\LabelingTask $task
     * @param int                $x
     * @param int                $y
     * @param int                $width
     * @param int                $height
     *
     * @return Model\Shapes\Rectangle
     */
    protected function getShape(Model\LabelingTask $task, $x, $y, $width, $height)
    {
        switch ($task->getDrawingTool()) {
            case 'pedestrian':
                return new Model\Shapes\Pedestrian(
                    $this->getUuid(),
                    round($x + ($width / 2)),
                    round($y),
                    round($x + ($width / 2)),
                    round($y + $height)
                );
                break;
            default:
                return new Model\Shapes\Rectangle(
                    $this->getUuid(),
                    $x,
                    $y,
                    $x + $width,
                    $y + $height
                );
                break;
        }
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $dataId
     * @param                    $frameNumber
     *
     * @return mixed
     */
    protected function getLabeledThing(Model\LabelingTask $task, $dataId, $frameNumber)
    {
        $frameIndexNumber = \array_search($frameNumber, $task->getFrameNumberMapping());
        if (!isset($this->dataIdToDatabaseIdMapping[$task->getId()][$dataId])) {
            $labeledThing = $this->createAndStoreNewLabeledThing(
                $task,
                $frameIndexNumber
            );

            $this->dataIdToDatabaseIdMapping[$task->getId()][$dataId] = $labeledThing;
        } else {
            /** @var Model\LabeledThing $labeledThing */
            $labeledThing = $this->dataIdToDatabaseIdMapping[$task->getId()][$dataId];
            $this->updateFrameIndexRange($labeledThing, $frameIndexNumber);
            $this->labeledThingFacade->save($labeledThing);
        }

        return $this->dataIdToDatabaseIdMapping[$task->getId()][$dataId];
    }

    /**
     * @param $tasks
     * @param $instruction
     * @param $frameNumber
     *
     * @return Model\LabelingTask
     * @throws \Exception
     */
    protected function findTaskForInstructionAndFrame($tasks, $instruction, $frameNumber)
    {
        $possibleTasks = array_filter(
            $tasks,
            function (Model\LabelingTask $task) use ($instruction, $frameNumber) {
                if ($task->getLabelInstruction() === $instruction &&
                    in_array($frameNumber, $task->getFrameNumberMapping())
                ) {
                    return true;
                }

                return false;
            }
        );

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
    protected function getUuid()
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',

            // 32 bits for "time_low"
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),

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
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff)
        );
    }

    /**
     * @param $label
     *
     * @return string
     */
    protected function extractInstruction($label)
    {
        $instruction = $label['label_class'];
        if (preg_match('/^(ignore-(\w+))$/', $label['label_class'], $matches)) {
            $instruction = 'ignore';

            return $instruction;
        }

        return $instruction;
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $frameIndexNumber
     *
     * @return Model\LabeledThing
     */
    protected function createAndStoreNewLabeledThing(Model\LabelingTask $task, $frameIndexNumber)
    {
        $labeledThing    = new Model\LabeledThing($task, rand(1, 50));
        $frameIndexRange = new Model\FrameIndexRange($frameIndexNumber, $frameIndexNumber);
        $labeledThing->setFrameRange($frameIndexRange);
        $this->labeledThingFacade->save($labeledThing);

        return $labeledThing;
    }

    /**
     * @param Model\LabeledThing $labeledThing
     * @param                    $frameIndexNumber
     */
    protected function updateFrameIndexRange(Model\LabeledThing $labeledThing, $frameIndexNumber)
    {
        $frameIndexRange = $labeledThing->getFrameRange();
        if ($frameIndexNumber < $frameIndexRange->getStartFrameIndex()) {
            $frameIndexRange->startFrameIndex = $frameIndexNumber;
        }
        if ($frameIndexNumber > $frameIndexRange->getEndFrameIndex()) {
            $frameIndexRange->endFrameIndex = $frameIndexNumber;
        }
        $labeledThing->setFrameRange($frameIndexRange);
    }
}