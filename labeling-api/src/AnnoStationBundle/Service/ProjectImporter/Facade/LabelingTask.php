<?php
namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class LabelingTask
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTask;

    /**
     * LabelingTask constructor.
     *
     * @param Facade\LabelingTask $labelingTask
     */
    public function __construct(Facade\LabelingTask $labelingTask)
    {
        $this->labelingTask = $labelingTask;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     *
     * @return Model\LabelingTask
     */
    public function save(Model\LabelingTask $labelingTask)
    {
        return $this->labelingTask->save($labelingTask);
    }
}
