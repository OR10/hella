<?php

namespace AppBundle\Model\Interpolation;

use AppBundle\Model;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class Status implements Model\Status
{
    const WAITING = 'waiting';
    const RUNNING = 'running';
    const SUCCESS = 'success';
    const ERROR = 'error';

    public static $validStates = [
        self::WAITING,
        self::RUNNING,
        self::SUCCESS,
        self::ERROR,
    ];

    /**
     * @var string
     * @CouchDB\Id
     */
    private $id;

    /**
     * @var string
     * @CouchDB\Version
     * @Serializer\Exclude
     */
    private $rev;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $status = self::WAITING;

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getRev()
    {
        return $this->rev;
    }

    /**
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param string $status
     */
    public function setStatus($status)
    {
        if (!in_array($status, static::$validStates)) {
            throw new \RuntimeException("Invalid state '{$status}'");
        }

        $this->status = $status;
    }
}
