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

    protected function getFacadeCache($key)
    {
        if (!$this->isInFacadeCache($key)) {
            throw new \RuntimeException('There is no facade in cache for ' . $key);
        }

        return $this->facadeCache[$key];
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