<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;

class Exports
{
    /**
     * @var Facade\Exporter
     */
    private $exporterFacade;

    public function __construct(Facade\Exporter $exporterFacade)
    {
        $this->exporterFacade = $exporterFacade;
    }

    /**
     * @param Model\Project $project
     */
    public function delete(Model\Project $project)
    {
        $exports = $this->exporterFacade->findAllByProject($project);
        foreach($exports as $export) {
            $this->exporterFacade->delete($export);
        }
    }
}
