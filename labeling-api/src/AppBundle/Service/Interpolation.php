<?php

namespace AppBundle\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service\Interpolation;

/**
 * Service to interpolate the shapes of a `LabeledThing` for a given frame
 * range.
 *
 * The `LabeledThing` may contain any number of already existing
 * `LabeledThingInFrame`s which can and should be used by the algorithm
 * imlementation to create the missing `LabeledThingInFrame`s for the frames
 * that don't have any `LabeledThingInFrame` yet.
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
     * @param Facade\LabeledThingInFrame
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\Status $statusFacade
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->statusFacade              = $statusFacade;
    }

    /**
     * Add new interpolation algorithm.
     *
     * @param Interpolation\Algorithm
     */
    public function addAlgorithm(Interpolation\Algorithm $algorithm)
    {
        if (isset($this->algorithms[$algorithm->getName()])) {
            throw new Interpolation\Exception("Algorithm with name '{$algorithm->getName()}' already exsists");
        }

        $this->algorithms[$algorithm->getName()] = $algorithm;
    }

    /**
     * @param string $algorithmName
     *
     * @return Interpolation\Algorithm
     */
    public function getAlgorithm($name)
    {
        if (!isset($this->algorithms[(string) $name])) {
            throw new Interpolation\Exception("Unknown algorithm '{$name}'");
        }

        return $this->algorithms[(string) $name];
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
     * @param Model\FrameRange                $frameRange
     * @param Model\Interpolation\Status|null $status
     */
    public function interpolateForRange(
        $algorithmName,
        Model\LabeledThing $labeledThing,
        Model\FrameRange $frameRange,
        Model\Interpolation\Status $status = null
    ) {
        $this->updateStatus($status, Model\Interpolation\Status::RUNNING);

        try {
            $labeledThing->getFrameRange()->throwIfFrameNumberIsNotCovered($frameRange->getStartFrameNumber());
            $labeledThing->getFrameRange()->throwIfFrameNumberIsNotCovered($frameRange->getEndFrameNumber());

            $algorithm = $this->getAlgorithm($algorithmName);

            $labeledThingsInFrame = [];

            $algorithm->interpolate(
                $labeledThing,
                $frameRange,
                function(Model\LabeledThingInFrame $labeledThingInFrame) use (&$labeledThingsInFrame) {
                    $labeledThingsInFrame[] = $labeledThingInFrame;

                    // TODO: make the number configurable
                    if (count($labeledThingsInFrame) == 10) {
                        $this->persistLabeledThingsInFrame($labeledThingsInFrame);
                        $labeledThingsInFrame = [];
                    }
                }
            );

            if (!empty($labeledThingsInFrame)) {
                $this->persistLabeledThingsInFrame($labeledThingsInFrame);
            }

            $this->updateStatus($status, Model\Interpolation\Status::SUCCESS);
        } catch (\Exception $e) {
            $this->updateStatus($status, Model\Interpolation\Status::ERROR);
        }
    }

    /**
     * FIXME: improve performance with bulk insert/update
     */
    private function persistLabeledThingsInFrame(array $labeledThingsInFrame)
    {
        foreach ($labeledThingsInFrame as $labeledThingInFrame) {
            $this->labeledThingInFrameFacade->save($labeledThingInFrame);
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
