<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class LabeledThingInFrame extends Base
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
    private $frameIndex;

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
     * @Serializer\Exclude
     */
    private $projectId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $labeledThingId;

    /**
     * @CouchDB\Field(type="boolean")
     */
    private $incomplete = true;

    /**
     * @CouchDB\Field(type="string")
     */
    private $identifierName;

    /**
     * @var bool
     */
    private $ghost = false;

    /**
     * @CouchDB\Field(type="string")
     */
    private $importLineNo;

    /**
     * @param LabeledThing $labeledThing
     * @param int $frameIndex
     * @param array $classes
     * @param array $shapes
     *
     * @return static
     */
    public static function create(
        LabeledThing $labeledThing,
        $frameIndex,
        array $classes = [],
        array $shapes = []
    ) {
        return new static($labeledThing, $frameIndex, $classes, $shapes);
    }

    /**
     * @param LabeledThing $labeledThing
     * @param int          $frameIndex
     * @param array        $classes
     * @param array        $shapes
     *
     * @throws \RangeException if the given $frameIndex is outside of the
     *         `FrameRange` of the given `$labeledThing`.
     */
    public function __construct(
        LabeledThing $labeledThing,
        $frameIndex,
        array $classes = [],
        array $shapes = []
    ) {
        $labeledThing->getFrameRange()->throwIfFrameIndexIsNotCovered($frameIndex);

        $this->taskId         = $labeledThing->getTaskId();
        $this->projectId      = $labeledThing->getProjectId();
        $this->labeledThingId = $labeledThing->getId();
        $this->frameIndex    = (int) $frameIndex;
        $this->classes        = $classes;
        $this->shapes         = $shapes;
    }

    /**
     * @param int|null $toFrameIndex
     * @param bool     $cloneIdAndRevision
     *
     * @return LabeledThingInFrame
     */
    public function copy($toFrameIndex = null, $cloneIdAndRevision = false)
    {
        $reflectionClass      = new \ReflectionClass(self::class);
        $copy                 = $reflectionClass->newInstanceWithoutConstructor();
        $copy->taskId         = $this->taskId;
        $copy->projectId      = $this->projectId;
        $copy->labeledThingId = $this->labeledThingId;
        $copy->classes        = $this->classes;
        $copy->shapes         = $this->shapes;
        $copy->incomplete     = $this->incomplete;
        $copy->ghost          = $this->ghost;
        $copy->identifierName = $this->identifierName;
        $copy->createdAt      = $this->createdAt;
        $copy->lastModifiedAt = $this->lastModifiedAt;

        if ($toFrameIndex === null) {
            $copy->frameIndex = $this->frameIndex;
        } else {
            $copy->frameIndex = (int) $toFrameIndex;
        }

        if ($cloneIdAndRevision === true) {
            $copy->id = $this->id;
            $copy->rev = $this->rev;
        }

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
    public function getFrameIndex()
    {
        return $this->frameIndex;
    }

    /**
     * @param int $frameIndex
     *
     * @return LabeledThingInFrame
     */
    public function setFrameIndex($frameIndex)
    {
        $this->frameIndex = (int) $frameIndex;

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
     * @param Shape []
     *
     * @return LabeledThingInFrame
     */
    public function setShapesAsObjects(array $shapes)
    {
        $this->shapes = array_map(
            function ($shape) {
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
            function (Shapes\BoundingBox $boundingBox = null, Shape $shape) {
                if ($boundingBox === null) {
                    return $shape->getBoundingBox();
                }

                return $boundingBox->merge($shape->getBoundingBox());
            }
        );
    }

    /**
     * @param null|string[] $ghostClasses
     */
    public function setGhostClasses($ghostClasses)
    {
        $this->ghostClasses = $ghostClasses;
    }

    /**
     * @return string[]|null
     */
    public function getGhostClasses()
    {
        return $this->ghostClasses;
    }

    /**
     * @return array
     */
    public function getClassesWithGhostClasses()
    {
        if ($this->getGhostClasses() === null) {
            return $this->getClasses();
        }
        return array_merge($this->getClasses(), $this->getGhostClasses());
    }

    /**
     * @return mixed
     */
    public function getIdentifierName()
    {
        return $this->identifierName;
    }

    /**
     * @param mixed $identifierName
     */
    public function setIdentifierName($identifierName)
    {
        $this->identifierName = $identifierName;
    }

    /**
     * @return mixed
     */
    public function getProjectId()
    {
        return $this->projectId;
    }

    /**
     * @param mixed $projectId
     */
    public function setProjectId($projectId)
    {
        $this->projectId = $projectId;
    }

    /**
     * @return mixed
     */
    public function getTaskId()
    {
        return $this->taskId;
    }

    /**
     * @param mixed $importLineNo
     */
    public function setImportLineNo($importLineNo)
    {
        $this->importLineNo = $importLineNo;
    }
}
