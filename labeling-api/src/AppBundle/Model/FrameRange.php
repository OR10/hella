<?php

namespace AppBundle\Model;

use AppBundle\Model\Exception;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class FrameRange
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
     * @param integer      $offset
     * @param integer|null $limit
     */
    public function createSubRangeForOffsetAndLimit($offset, $limit = null)
    {
        if (is_null($offset) || $offset < $this->getStartFrameNumber() - 1) {
            $offset = $this->getStartFrameNumber() - 1;
        }

        if ($offset > $this->getEndFrameNumber()) {
            $offset = $this->getEndFrameNumber() - 1;
            $limit  = max(1, $limit - $offset);
        }

        if (is_null($limit) || $limit > $this->getNumberOfFrames()) {
            $limit = $this->getNumberOfFrames() - $offset;
        }

        return static::createFromOffsetAndLimit($offset, $limit);
    }
}
