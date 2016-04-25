<?php

namespace AppBundle\Service;

use AppBundle\Model;

interface LabelImporter
{
    /**
     * Import Labels for a given Project
     *
     * @param Model\LabelingTask[] $tasks
     * @param array                $data
     */
    public function importLabels(array $tasks, array $data);
}
