<?php

namespace AnnoStationBundle\Worker\Jobs;

use crosscan\WorkerPool;

class DatabaseDeleter extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $databaseName;

    /**
     * @param $databaseName
     */
    public function __construct(string $databaseName)
    {
        $this->databaseName = $databaseName;
    }

    /**
     * @return string
     */
    public function getDatabaseName(): string
    {
        return $this->databaseName;
    }
}
