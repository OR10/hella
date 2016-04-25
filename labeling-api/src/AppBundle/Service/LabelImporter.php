<?php

namespace AppBundle\Service;

use AppBundle\Model;
use Symfony\Component\Console\Helper\ProgressBar;

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
     * Optionally set a progressbar to inform about import status
     *
     * The progressbar isn't required. If it is not set it will simply not be used for information callbacks.
     *
     * @param ProgressBar $progressBar
     */
    public function setProgressBar(ProgressBar $progressBar);
}
