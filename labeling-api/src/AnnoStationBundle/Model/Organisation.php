<?php

namespace AnnoStationBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;
use AppBundle\Model as AppBundleModel;

/**
 * @CouchDB\Document
 */
class Organisation extends AppBundleModel\Base
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
     * @CouchDB\Field(type="string")
     */
    private $name;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $quota;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $userQuota;

    public function __construct($name, $quota = 0, $userQuota = 0)
    {
        $this->name      = $name;
        $this->quota     = $quota;
        $this->userQuota = $userQuota;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return mixed
     */
    public function getRev()
    {
        return $this->rev;
    }

    /**
     * @return mixed
     */
    public function getQuota()
    {
        if ($this->quota === null) {
            return 0;
        }

        return $this->quota;
    }

    /**
     * @param mixed $quota
     */
    public function setQuota($quota)
    {
        $this->quota = $quota;
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return mixed
     */
    public function getUserQuota()
    {
        if ($this->userQuota === null) {
            return 0;
        }

        return $this->userQuota;
    }

    /**
     * @param mixed $userQuota
     */
    public function setUserQuota($userQuota)
    {
        $this->userQuota = $userQuota;
    }
}
