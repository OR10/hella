<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class LabeledThingInFrame
{
    /**
     * @CouchDB\Id(strategy="ASSIGNED")
     */
    private $id;

    /**
     * @CouchDB\Version
     */
    private $rev;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $frameNumber;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $classes = [];

    /**
     * @var null|array
     */
    private $ghostClasses = null;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $shapes = [];

    /**
     * @CouchDB\Field(type="string")
     * @Serializer\Exclude
     */
    private $taskId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $labeledThingId;

    /**
     * @CouchDB\Field(type="boolean")
     */
    private $incomplete = true;

    /**
     * @var bool
     */
    private $ghost = false;

    /**
     * @param LabeledThing $labeledThing
     * @param int          $frameNumber
     * @param array        $classes
     * @param array        $shapes
     */
    public static function create(
        LabeledThing $labeledThing,
        $frameNumber,
        array $classes = [],
        array $shapes = []
    ) {
        return new static($labeledThing, $frameNumber, $classes, $shapes);
    }

    /**
     * @param LabeledThing $labeledThing
     * @param int          $frameNumber
     * @param array        $classes
     * @param array        $shapes
     *
     * @throws \RangeException if the given $frameNumber is outside of the
     *         `FrameRange` of the given `$labeledThing`.
     */
    public function __construct(
        LabeledThing $labeledThing,
        $frameNumber,
        array $classes = [],
        array $shapes = []
    ) {
        $labeledThing->getFrameRange()->throwIfFrameNumberIsNotCovered($frameNumber);

        $this->taskId         = $labeledThing->getTaskId();
        $this->labeledThingId = $labeledThing->getId();
        $this->frameNumber    = (int) $frameNumber;
        $this->classes        = $classes;
        $this->shapes         = $shapes;
    }

    /**
     * @param int $toFrameNumber
     *
     * @return LabeledThingInFrame
     */
    public function copy($toFrameNumber)
    {
        $reflectionClass      = new \ReflectionClass(self::class);
        $copy                 = $reflectionClass->newInstanceWithoutConstructor();
        $copy->taskId         = $this->taskId;
        $copy->labeledThingId = $this->labeledThingId;
        $copy->frameNumber    = (int) $toFrameNumber;
        $copy->classes        = $this->classes;
        $copy->shapes         = $this->shapes;
        $copy->incomplete     = $this->incomplete;
        $copy->ghost          = $this->ghost;

        return $copy;
    }

    /**
     * @return string
     */
    public function getLabeledThingId()
    {
        return $this->labeledThingId;
    }

    /**
     * @param array $classes
     *
     * @return LabeledThingInFrame
     */
    public function setClasses(array $classes)
    {
        $this->classes = $classes;

        return $this;
    }

    /**
     * @return array
     */
    public function getClasses()
    {
        return $this->classes;
    }

    /**
     * @param mixed $shapes
     *
     * @return LabeledThingInFrame
     */
    public function setShapes(array $shapes)
    {
        $this->shapes = $shapes;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getFrameNumber()
    {
        return $this->frameNumber;
    }

    /**
     * @param int $frameNumber
     *
     * @return LabeledThingInFrame
     */
    public function setFrameNumber($frameNumber)
    {
        $this->frameNumber = (int) $frameNumber;

        return $this;
    }

    /**
     * @return array
     */
    public function getShapes()
    {
        return $this->shapes;
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
    public function getIncomplete()
    {
        return $this->incomplete;
    }

    /**
     * @param mixed $incomplete
     *
     * @return LabeledThingInFrame
     */
    public function setIncomplete($incomplete)
    {
        $this->incomplete = (bool) $incomplete;

        return $this;
    }

    /**
     * @param mixed $id
     *
     * @return LabeledThingInFrame
     *
     * @throws \LogicException if the id was already set.
     */
    public function setId($id)
    {
        if ($this->id !== null) {
            throw new \LogicException("Trying to set an already assigned id from '{$this->id}' to '{$id}'");
        }

        $this->id = $id;

        return $this;
    }

    /**
     * @return boolean
     */
    public function isGhost()
    {
        return $this->ghost;
    }

    /**
     * @param boolean $ghost
     *
     * @return LabeledThingInFrame
     */
    public function setGhost($ghost)
    {
        $this->ghost = $ghost;

        return $this;
    }

    /**
     * Get an array of shapes instantiated as objects.
     *
     * @return Shape[]
     */
    public function getShapesAsObjects()
    {
        return array_map([Shape::class, 'createFromArray'], $this->shapes);
    }

    /**
     * Set an array of shapes as objects.
     *
     * @param Shape[]
     *
     * @return LabeledThingInFrame
     */
    public function setShapesAsObjects(array $shapes)
    {
        $this->shapes = array_map(
            function($shape) {
                return $shape->toArray();
            },
            $shapes
        );

        return $this;
    }

    /**
     * @return BoundingBox
     */
    public function getBoundingBox()
    {
        if (empty($this->shapes)) {
            throw new \RuntimeException("Trying to get a bounding box without any shape");
        }

        return array_reduce(
            $this->getShapesAsObjects(),
            function(Shapes\BoundingBox $boundingBox = null, Shape $shape) {
                if ($boundingBox === null) {
                    return $shape->getBoundingBox();
                }
                return $boundingBox->merge($shape->getBoundingBox());
            }
        );
    }

    /**
     * @param null $ghostClasses
     */
    public function setGhostClasses($ghostClasses)
    {
        $this->ghostClasses = $ghostClasses;
    }
}
