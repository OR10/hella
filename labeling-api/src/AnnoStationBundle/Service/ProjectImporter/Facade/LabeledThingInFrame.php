<?php
namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class LabeledThingInFrame
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrame;

    /**
     * LabeledThing constructor.
     *
     * @param Facade\LabeledThingInFrame $labeledThingInFrame
     */
    public function __construct(Facade\LabeledThingInFrame $labeledThingInFrame)
    {
        $this->labeledThingInFrame = $labeledThingInFrame;
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return Model\LabeledThingInFrame
     */
    public function save(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        return $this->labeledThingInFrame->save($labeledThingInFrame);
    }
}