<?php
namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class LabeledThing
{
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThing;

    /**
     * LabeledThing constructor.
     *
     * @param Facade\LabeledThing $labeledThing
     */
    public function __construct(Facade\LabeledThing $labeledThing)
    {
        $this->labeledThing = $labeledThing;
    }

    /**
     * @param Model\LabeledThing $labeledThing
     *
     * @return Model\LabeledThing
     */
    public function save(Model\LabeledThing $labeledThing)
    {
        return $this->labeledThing->save($labeledThing);
    }
}