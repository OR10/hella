<?php

namespace AppBundle\Service;

use AppBundle\Model;

interface LabelImporter
{
    /**
     * Import Labels for a given Project
     *
     * @param Model\Project $project
     * @param $data
     * @return mixed
     */
    public function importLabels(Model\Project $project, array $data);
}
