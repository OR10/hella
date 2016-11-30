<?php

namespace AnnoStationBundle\Service;

use AppBundle\Helper\ProgressIndicator;
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

    /**
     * Optionally set a progress indicator to inform about import status
     *
     * The progress indicator isn't required. If it is not set it will simply not be used for information callbacks.
     *
     * @param ProgressIndicator $progressIndicator
     */
    public function setProgressIndicator(ProgressIndicator $progressIndicator);
}
