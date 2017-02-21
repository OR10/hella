<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use AnnoStationBundle\Model as AnnoStationBundleModel;

/**
 * @CouchDB\Document
 */
class LabelingGroup
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
     * @CouchDB\Field(type="mixed")
     */
    private $coordinators = [];

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $labeler = [];

    /**
     * @CouchDB\Field(type="string")
     */
    private $name;

    /**
     * @CouchDB\Field(type="string")
     */
    private $organisationId;

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param                                     $coordinators
     * @param                                     $labeler
     *
     * @return static
     */
    public static function create(AnnoStationBundleModel\Organisation $organisation, $coordinators, $labeler)
    {
        return new static($organisation, $coordinators, $labeler);
    }

    /**
     * LabelingGroup constructor.
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param                                     $coordinators
     * @param                                     $labeler
     * @param                                     $name
     */
    public function __construct(
        AnnoStationBundleModel\Organisation $organisation,
        $coordinators,
        $labeler,
        $name = null
    ) {
        $this->organisationId = $organisation->getId();
        $this->coordinators   = $coordinators;
        $this->labeler        = $labeler;
        $this->name           = $name;
    }

    /**
     * @return mixed
     */
    public function getLabeler()
    {
        return $this->labeler;
    }

    /**
     * @param mixed $labeler
     */
    public function setLabeler($labeler)
    {
        $this->labeler = $labeler;
    }

    /**
     * @return mixed
     */
    public function getCoordinators()
    {
        return $this->coordinators;
    }

    /**
     * @param mixed $coordinators
     */
    public function setCoordinators($coordinators)
    {
        $this->coordinators = $coordinators;
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
    public function getOrganisationId()
    {
        return $this->organisationId;
    }

    /**
     * @param mixed $organisationId
     */
    public function setOrganisationId($organisationId)
    {
        $this->organisationId = $organisationId;
    }
}
