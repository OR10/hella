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
     */
    public function __construct($coordinators, $labeler)
    {
        $this->coordinators = $coordinators;
        $this->labeler      = $labeler;
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
}