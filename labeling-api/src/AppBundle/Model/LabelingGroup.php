<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

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
     * @param $coordinators
     * @param $labeler
     * @return static
     */
    public static function create($coordinators, $labeler)
    {
        return new static($coordinators, $labeler);
    }

    /**
     * LabelingGroup constructor.
     * @param $coordinators
     * @param $labeler
     * @param $name
     */
    public function __construct($coordinators, $labeler, $name = null)
    {
        $this->coordinators = $coordinators;
        $this->labeler      = $labeler;
        $this->name         = $name;
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
}