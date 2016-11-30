<?php

namespace AnnoStationBundle\Service;

use AppBundle\Model;

interface TaskExporter
{
    /**
     * Export data for the given task.
     *
     * @param Model\LabelingTask $task
     *
     * @return mixed
     */
    public function exportLabelingTask(Model\LabelingTask $task);
}
