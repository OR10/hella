<?php

namespace AnnoStationBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;
use AppBundle\Model as AppBundleModel;

/**
 * @CouchDB\Document
 */
class Campaign extends AppBundleModel\Base
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
     * @CouchDB\Field(type="string")
     */
    private $organisationId;

    public function __construct(Organisation $organisation, $name)
    {
        $this->name           = $name;
        $this->organisationId = $organisation->getId();
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }
}
