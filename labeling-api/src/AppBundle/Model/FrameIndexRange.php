<?php

namespace AppBundle\Model;

use AppBundle\Model\Exception;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class FrameIndexRange extends Base
{
    /**
     * @CouchDB\Id
     * @Serializer\Exclude
     */
    private $id;

    /**
     * @CouchDB\Version
     * @Serializer\Exclude
     */
    private $rev;

    /**
     * @var integer
     * @CouchDB\Field(type="integer")
     * @Serializer\Groups({"statistics"})
     */
    public $startFrameIndex;

    /**
     * @var integer
     * @CouchDB\Field(type="integer")
     * @Serializer\Groups({"statistics"})
     */
    public $endFrameIndex;

    /**
     * @param integer $startFrameIndex First frame index of this range.
     * @param integer|null $endFrameIndex Last frame index of this range.
     *
     * @throws Exception\InvalidRange
     * @throws Exception\InvalidStartFrameIndex
     */
    public function __construct($startFrameIndex, $endFrameIndex = null)
    {
        $this->startFrameIndex = (int) $startFrameIndex;

        if (is_null($endFrameIndex)) {
            $this->endFrameIndex = $this->startFrameIndex;
        } else {
            $this->endFrameIndex = (int) $endFrameIndex;
        }

        if ($this->startFrameIndex < 0) {
            throw new Exception\InvalidStartFrameIndex($this->startFrameIndex);
        }

        if ($this->startFrameIndex > $this->endFrameIndex) {
            throw new Exception\InvalidRange($this->startFrameIndex, $this->endFrameIndex);
        }
    }

    /**
     * Construct a new frame range from an offset and a limit.
     *
     * @param integer      $offset
     * @param integer|null $limit
     */
    public static function createFromOffsetAndLimit($offset, $limit = null)
    {
        $startFrameIndex = 1 + $offset;
        $endFrameIndex   = $limit
                          ? $offset + $limit
                          : $startFrameIndex;

        return new FrameIndexRange($startFrameIndex, $endFrameIndex);
    }

    /**
     * Construct a new frame range from an array.
     */
    public static function createFromArray(array $array)
    {
        if (!isset($array['startFrameIndex']) || !isset($array['endFrameIndex'])) {
            throw new Exception\FrameRange();
        }

        return new FrameIndexRange($array['startFrameIndex'], $array['endFrameIndex']);
    }

    /**
     * Get the starting frame index.
     *
     * @return integer
     */
    public function getStartFrameIndex()
    {
        return $this->startFrameIndex;
    }

    /**
     * Get the last frame index.
     *
     * @return integer
     */
    public function getEndFrameIndex()
    {
        return $this->endFrameIndex;
    }

    /**
     * Get the index of frames covered by this range.
     */
    public function getNumberOfFrames()
    {
        return $this->endFrameIndex - $this->startFrameIndex + 1;
    }

    /**
     * Get an iterable range of all frames covered by this frame range.
     *
     * @return array
     */
    public function getRange()
    {
        return range($this->getStartFrameIndex(), $this->getEndFrameIndex());
    }

    /**
     * Return a new range from the given offset and limit which is guaranteed
     * to be a sub-range of this range.
     *
     * @param integer|null $offset
     * @param integer|null $limit
     */
    public function createSubRangeForOffsetAndLimit($offset = null, $limit = null)
    {
        $startFrameIndex = $this->getStartFrameIndex();
        $endFrameIndex   = $this->getEndFrameIndex();

        if ($offset !== null) {
            $startFrameIndex = max(
                $startFrameIndex,
                min(
                    $endFrameIndex,
                    $startFrameIndex + (int) $offset
                )
            );
        }

        if ($limit !== null) {
            $endFrameIndex = max(
                $startFrameIndex,
                min(
                    $endFrameIndex,
                    $startFrameIndex + (int) $limit - 1
                )
            );
        }

        return new FrameIndexRange($startFrameIndex, $endFrameIndex);
    }

    /**
     * Check wether or not the given frame range is a subrange of this range.
     *
     * @param FrameIndexRange $otherFrameRange
     *
     * @return boolean
     */
    public function coversFrameRange(FrameIndexRange $otherFrameRange)
    {
        return $this->coversFrameIndex($otherFrameRange->getStartFrameIndex())
            && $this->coversFrameIndex($otherFrameRange->getEndFrameIndex());
    }

    /**
     * Throw exception if given `$otherFrameRange` is not covered by this frame
     * range.
     *
     * @throws \RangeException
     */
    public function throwIfFrameRangeIsNotCovered(FrameIndexRange $otherFrameRange)
    {
        if (!$this->coversFrameRange($otherFrameRange)) {
            throw new \RangeException(
                sprintf(
                    "FrameRange '%d - %d' is not completly covered by FrameRange '%d - %d'",
                    $otherFrameRange->getStartFrameIndex(),
                    $otherFrameRange->getEndFrameIndex(),
                    $this->getStartFrameIndex(),
                    $this->getEndFrameIndex()
                )
            );
        }
    }

    /**
     * Check wether or not the given frame index is covered by this frame range.
     *
     * @param int $frameIndex
     *
     * @return boolean
     */
    public function coversFrameIndex($frameIndex)
    {
        return $this->startFrameIndex <= (int) $frameIndex && (int) $frameIndex <= $this->endFrameIndex;
    }

    /**
     * Throw exception if given `$frameIndex` is not covered by this frame range.
     *
     * @throws \RangeException
     */
    public function throwIfFrameIndexIsNotCovered($frameIndex)
    {
        if (!$this->coversFrameIndex($frameIndex)) {
            throw new \RangeException(
                sprintf(
                    "FrameIndex '%d' outside of FrameRange '%d - %d'",
                    $frameIndex,
                    $this->getStartFrameIndex(),
                    $this->getEndFrameIndex()
                )
            );
        }
    }
}
