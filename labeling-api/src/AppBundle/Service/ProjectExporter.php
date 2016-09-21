<?php

namespace AppBundle\Service;

use AppBundle\Model;

interface ProjectExporter
{
    /**
     * Export data for the given task.
     *
     * @param Model\ProjectExport $projectExport
     *
     * @return mixed
     */
    public function exportProject(Model\ProjectExport $projectExport);
}
