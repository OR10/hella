<?php

namespace AppBundle\Service;

use AppBundle\Model;

interface ProjectExporter
{
    /**
     * Export data for the given task.
     *
     * @param Model\Project $project
     * @return mixed
     *
     */
    public function exportProject(Model\Project $project);
}
