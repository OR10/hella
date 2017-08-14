<?php

namespace crosscan\Message;

/**
 * Class WayPoint
 * @property-read string $host
 * @property-read int    $timestamp
 * @property-read string $routingKey
 * @property-read string $workerClass
 */
class WayPoint
{
    private $host;
    private $timestamp;
    private $routingKey;
    private $workerClass;

    /**
     * @param int    $timestamp
     * @param string $host
     * @param string $routingKey
     * @param string $workerClass
     */
    public function __construct($timestamp, $host, $routingKey, $workerClass)
    {
        $this->timestamp   = $timestamp;
        $this->host        = $host;
        $this->routingKey  = $routingKey;
        $this->workerClass = $workerClass;
    }

    public function __get($name)
    {
        switch ($name) {
            case 'timestamp':
            case 'host':
            case 'routingKey':
            case 'workerClass':
                return $this->$name;
                break;
            default:
                throw new \Exception("No such property: " . $name);
        }
    }
}