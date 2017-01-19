<?php
namespace AnnoStationBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Service;

class LabeledThingInFrameForLabeledThing implements \IteratorAggregate
{
    /**
     * @var array
     */
    private $labeledThingsInFrames = [];

    /**
     * @var Service\GhostClassesPropagation
     */
    private $ghostClassesPropagation;

    /**
     * @var Model\LabeledThing
     */
    private $labeledThing;
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * LabelingTask constructor.
     *
     * @param Facade\LabeledThing             $labeledThingFacade
     * @param Model\LabeledThing              $labeledThing
     * @param Service\GhostClassesPropagation $ghostClassesPropagation
     */
    public function __construct(
        Facade\LabeledThing $labeledThingFacade,
        Model\LabeledThing $labeledThing,
        Service\GhostClassesPropagation $ghostClassesPropagation
    ) {
        $this->ghostClassesPropagation = $ghostClassesPropagation;
        $this->labeledThing            = $labeledThing;
        $this->labeledThingFacade      = $labeledThingFacade;
    }

    public function getIterator()
    {
        return $this->labelingThingsInFramesIteratorGenerator();
    }

    private function labelingThingsInFramesIteratorGenerator()
    {
        if (empty($this->labeledThingsInFrames)) {
            $this->labeledThingsInFrames = $this->labeledThingFacade->getLabeledThingInFrames($this->labeledThing);
        }

        $this->labeledThingsInFrames = $this->ghostClassesPropagation->propagateGhostClasses(
            $this->labeledThingsInFrames
        );

        usort(
            $this->labeledThingsInFrames,
            function (Model\LabeledThingInFrame $a, Model\LabeledThingInFrame $b) {
                return strcmp($a->getFrameIndex(), $b->getFrameIndex());
            }
        );

        foreach ($this->labeledThingsInFrames as $labeledThingInFrame) {
            yield $labeledThingInFrame;
        }
    }
}
