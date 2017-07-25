<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class MonitoringCheckResults
{
    /**
     * @CouchDB\Id
     */
    private $id;

    /**
     * @CouchDB\Version
     */
    private $rev;

    /**
     * @CouchDB\Field(type="datetime")
     */
    private $date;

    /**
     * @CouchDB\Field(type="string")
     */
    private $globalCheckStatus;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $checks;

    public function __construct($globalCheckStatus, $checks = [], \DateTime $date = null)
    {
        $this->globalCheckStatus = $globalCheckStatus;
        $this->checks            = $checks;
        if ($date === null) {
            $this->date = new \DateTime('now', new \DateTimeZone('UTC'));
        } else {
            $this->date = $date;
        }
    }

    /**
     * @param $serviceId
     * @param $check
     */
    public function addCheck($serviceId, $check)
    {
        $this->checks[$serviceId] = $check;
    }

    /**
     * @return mixed
     */
    public function getGlobalCheckStatus()
    {
        return $this->globalCheckStatus;
    }

    /**
     * @param mixed $globalCheckStatus
     */
    public function setGlobalCheckStatus($globalCheckStatus)
    {
        $this->globalCheckStatus = $globalCheckStatus;
    }

    /**
     * @return mixed
     */
    public function getChecks()
    {
        return $this->checks;
    }
}
