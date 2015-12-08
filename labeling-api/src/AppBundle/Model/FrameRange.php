<?php

namespace AppBundle\Model;

use AppBundle\Model\Exception;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class FrameRange
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
     */
    public $startFrameNumber;

    /**
     * @var integer
     * @CouchDB\Field(type="integer")
     */
    public $endFrameNumber;

    /**
     * @param integer      $startFrameNumber First frame number of this range.
     * @param integer|null $endFrameNumber   Last frame number of this range.
     */
    public function __construct($startFrameNumber, $endFrameNumber = null)
    {
        $this->startFrameNumber = (int) $startFrameNumber;

        if (is_null($endFrameNumber)) {
            $this->endFrameNumber = $this->startFrameNumber;
        } else {
            $this->endFrameNumber = (int) $endFrameNumber;
        }

        if ($this->startFrameNumber < 1) {
            throw new Exception\InvalidStartFrameNumber($this->startFrameNumber);
        }

        if ($this->startFrameNumber > $this->endFrameNumber) {
            throw new Exception\InvalidRange($this->startFrameNumber, $this->endFrameNumber);
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
        $startFrameNumber = 1 + $offset;
        $endFrameNumber   = $limit
                          ? $offset + $limit
                          : $startFrameNumber;

        return new FrameRange($startFrameNumber, $endFrameNumber);
    }

    /**
     * Construct a new frame range from an array.
     */
    public static function createFromArray(array $array)
    {
        if (!isset($array['startFrameNumber']) || !isset($array['endFrameNumber'])) {
            throw new Exception\FrameRange();
        }

        return new FrameRange($array['startFrameNumber'], $array['endFrameNumber']);
    }

    /**
     * Get the starting frame number.
     *
     * @return integer
     */
    public function getStartFrameNumber()
    {
        return $this->startFrameNumber;
    }

    /**
     * Get the last frame number.
     *
     * @return integer
     */
    public function getEndFrameNumber()
    {
        return $this->endFrameNumber;
    }

    /**
     * Get the number of frames covered by this range.
     */
    public function getNumberOfFrames()
    {
        return $this->endFrameNumber - $this->startFrameNumber + 1;
    }

    /**
     * Get an iterable range of all frames covered by this frame range.
     *
     * @return array
     */
    public function getRange()
    {
        return range($this->getStartFrameNumber(), $this->getEndFrameNumber());
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
        $startFrameNumber = $this->getStartFrameNumber();
        $endFrameNumber   = $this->getEndFrameNumber();

        if ($offset !== null) {
            $startFrameNumber = max(
                $startFrameNumber,
                min(
                    $endFrameNumber,
                    $startFrameNumber + (int) $offset
                )
            );
        }

        if ($limit !== null) {
            $endFrameNumber = max(
                $startFrameNumber,
                min(
                    $endFrameNumber,
                    $startFrameNumber + (int) $limit - 1
                )
            );
        }

        return new FrameRange($startFrameNumber, $endFrameNumber);
    }

    /**
     * Check wether or not the given frame range is a subrange of this range.
     *
     * @param FrameRange $otherFrameRange
     *
     * @return boolean
     */
    public function coversFrameRange(FrameRange $otherFrameRange)
    {
        return $this->coversFrameNumber($otherFrameRange->getStartFrameNumber())
            && $this->coversFrameNumber($otherFrameRange->getEndFrameNumber());
    }

    /**
     * Throw exception if given `$otherFrameRange` is not covered by this frame
     * range.
     *
     * @throws \RangeException
     */
    public function throwIfFrameRangeIsNotCovered(FrameRange $otherFrameRange)
    {
        if (!$this->coversFrameRange($otherFrameRange)) {
            throw new \RangeException(
                sprintf(
                    "FrameRange '%d - %d' is not completly covered by FrameRange '%d - %d'",
                    $otherFrameRange->getStartFrameNumber(),
                    $otherFrameRange->getEndFrameNumber(),
                    $this->getStartFrameNumber(),
                    $this->getEndFrameNumber()
                )
            );
        }
    }

    /**
     * Check wether or not the given frame number is covered by this frame range.
     *
     * @param int $frameNumber
     *
     * @return boolean
     */
    public function coversFrameNumber($frameNumber)
    {
        return $this->startFrameNumber <= (int) $frameNumber && (int) $frameNumber <= $this->endFrameNumber;
    }

    /**
     * Throw exception if given `$frameNumber` is not covered by this frame range.
     *
     * @throws \RangeException
     */
    public function throwIfFrameNumberIsNotCovered($frameNumber)
    {
        if (!$this->coversFrameNumber($frameNumber)) {
            throw new \RangeException(
                sprintf(
                    "FrameNumber '%d' outside of FrameRange '%d - %d'",
                    $frameNumber,
                    $this->getStartFrameNumber(),
                    $this->getEndFrameNumber()
                )
            );
        }
    }
}
