<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;

class TaskExports
{
    /**
     * @var Facade\TaskExport
     */
    private $taskExportFacade;

    public function __construct(Facade\TaskExport $taskExportFacade)
    {
        $this->taskExportFacade = $taskExportFacade;
    }

    public function delete(Model\LabelingTask $labelingTask)
    {
        $exports = $this->taskExportFacade->findAllByTask($labelingTask);
        foreach($exports as $export) {
            $this->taskExportFacade->delete($export);
        }
    }
}
