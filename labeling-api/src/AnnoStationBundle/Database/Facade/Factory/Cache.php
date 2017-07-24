<?php

namespace AnnoStationBundle\Database\Facade\Factory;

class Cache
{
    /**
     * @var array
     */
    private $facadeCache = [];

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
