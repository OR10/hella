<?php

namespace AnnoStationBundle\Database\Facade;

abstract class Factory
{
    /**
     * @var array
     */
    private $facadeCache = [];

    abstract public function getFacadeByProjectIdAndTaskId($projectId, $taskId);

    abstract public function getReadOnlyFacade();

    protected function getFacadeCache($database)
    {
        if (!$this->isInFacadeCache($database)) {
            throw new \RuntimeException('There is no facade in cache for ' . $database);
        }

        return $this->facadeCache[$database];
    }

    protected function isInFacadeCache($database)
    {
        return isset($this->facadeCache[$database]);
    }

    protected function addFacadeCache($database, $facade)
    {
        $this->facadeCache[$database] = $facade;
    }
}