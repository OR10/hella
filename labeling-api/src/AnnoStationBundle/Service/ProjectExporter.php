<?php

namespace AnnoStationBundle\Service;

use AppBundle\Model;

interface ProjectExporter
{
    /**
     * Export data for the given task.
     *
     * @param Model\Export $export
     *
     * @return mixed
     */
    public function exportProject(Model\Export $export);
}
