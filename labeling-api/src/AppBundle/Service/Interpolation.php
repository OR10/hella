<?php

namespace AppBundle\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service\Interpolation;

/**
 * Service to interpolate the shapes of a `LabeledThing` for a given frame range.
 *
 * The `LabeledThing` may contain any number of already existing `LabeledThingInFrame`s which can and should be used by
 * the algorithm implementation to create the missing `LabeledThingInFrame`s for the frames that don't have any
 * `LabeledThingInFrame` yet.
 */
class Interpolation
{
    /**
     * @var Interpolation\Algorithm[]
     */
    private $algorithms = [];

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Facade\Status
     */
    private $statusFacade;

    /**
     * @var int
     */
    private $numberOfBulkUpdates = 100;

    /**
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\Status              $statusFacade
     */
    public function __construct(Facade\LabeledThingInFrame $labeledThingInFrameFacade, Facade\Status $statusFacade)
    {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->statusFacade              = $statusFacade;
    }

    /**
     * Add new interpolation algorithm.
     *
     * @param Interpolation\Algorithm $algorithm
     *
     * @throws Interpolation\Exception
     */
    public function addAlgorithm(Interpolation\Algorithm $algorithm)
    {
        if (isset($this->algorithms[$algorithm->getName()])) {
            throw new Interpolation\Exception("Algorithm with name '{$algorithm->getName()}' already exsists");
        }

        $this->algorithms[$algorithm->getName()] = $algorithm;
    }

    /**
     * @param string $name
     *
     * @return Interpolation\Algorithm
     *
     * @throws Interpolation\Exception
     */
    public function getAlgorithm(string $name)
    {
        if (!isset($this->algorithms[$name])) {
            throw new Interpolation\Exception(sprintf('Unknown algorithm %s', $name));
        }

        return $this->algorithms[$name];
    }

    /**
     * @param int $numberOfBulkUpdates
     */
    public function setNumberOfBulkUpdates($numberOfBulkUpdates)
    {
        if ($numberOfBulkUpdates < 1 || $numberOfBulkUpdates > 1000) {
            throw new \InvalidArgumentException(sprintf('Invalid number of bulk updates %s', $numberOfBulkUpdates));
        }

        $this->numberOfBulkUpdates = (int) $numberOfBulkUpdates;
    }

    /**
     * Interpolate for the whole frame range of the given `$labeledThing` using
     * the algorithm identified by `$algorithmName`.
     * The algorithm has to be added with `addAlgorithm` first.
     * A status object may be passed as optional parameter which will be
     * updated according to the interpolation status.
     *
     * @param string                          $algorithmName
     * @param Model\LabeledThing              $labeledThing
     * @param Model\Interpolation\Status|null $status
     */
    public function interpolate(
        $algorithmName,
        Model\LabeledThing $labeledThing,
        Model\Interpolation\Status $status = null
    ) {
        $this->interpolateForRange($algorithmName, $labeledThing, $labeledThing->getFrameRange(), $status);
    }

    /**
     * Interpolate for the given `$frameRange` and `$labeledThing` using the
     * algorithm identified by `$algorithmName`.
     * The algorithm has to be added with `addAlgorithm` first.
     * A status object may be passed as optional parameter which will be
     * updated according to the interpolation status.
     *
     * @param string                          $algorithmName
     * @param Model\LabeledThing              $labeledThing
     * @param Model\FrameIndexRange           $frameRange
     * @param Model\Interpolation\Status|null $status
     */
    public function interpolateForRange(
        $algorithmName,
        Model\LabeledThing $labeledThing,
        Model\FrameIndexRange $frameRange,
        Model\Interpolation\Status $status = null
    ) {
        $this->updateStatus($status, Model\Interpolation\Status::RUNNING);

        try {
            $labeledThing->getFrameRange()->throwIfFrameIndexIsNotCovered($frameRange->getStartFrameIndex());
            $labeledThing->getFrameRange()->throwIfFrameIndexIsNotCovered($frameRange->getEndFrameIndex());

            $algorithm = $this->getAlgorithm($algorithmName);

            $labeledThingsInFrame = [];

            $algorithm->interpolate(
                $labeledThing,
                $frameRange,
                function (Model\LabeledThingInFrame $labeledThingInFrame) use (&$labeledThingsInFrame) {
                    $labeledThingsInFrame[] = $labeledThingInFrame;

                    // TODO: make the number configurable
                    if (count($labeledThingsInFrame) === $this->numberOfBulkUpdates) {
                        $this->labeledThingInFrameFacade->saveAll($labeledThingsInFrame);
                        $labeledThingsInFrame = [];
                    }
                }
            );

            if (!empty($labeledThingsInFrame)) {
                $this->labeledThingInFrameFacade->saveAll($labeledThingsInFrame);
            }

            $this->updateStatus($status, Model\Interpolation\Status::SUCCESS);
        } catch (\Exception $e) {
            $this->updateStatus($status, Model\Interpolation\Status::ERROR);
        }
    }

    /**
     * Update the given `$status` if it is not null or otherwise do nothing.
     *
     * @param Model\Interpolation\Status|null $status
     * @param string                          $newState
     */
    private function updateStatus(Model\Interpolation\Status $status = null, $newState)
    {
        if ($status !== null) {
            $status->setStatus($newState);
            $this->statusFacade->save($status);
        }
    }
}
