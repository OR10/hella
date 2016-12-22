<?php

namespace AnnoStationBundle\Worker\Jobs;

use AppBundle\Model;
use crosscan\WorkerPool;

class Interpolation extends WorkerPool\Job
{
    /**
     * @var string
     */
    private $labeledThingId;

    /**
     * @var string
     */
    private $algorithm;

    /**
     * @var int
     */
    private $startFrameIndex;

    /**
     * @var int
     */
    private $endFrameIndex;

    /**
     * @var string
     */
    private $statusId;

    /**
     * @param string                          $labeledThingId
     * @param string                          $algorithm
     * @param Model\FrameIndexRange                $frameRange
     * @param Model\Interpolation\Status|null $status
     */
    public function __construct(
        $labeledThingId,
        $algorithm,
        Model\FrameIndexRange $frameRange,
        Model\Interpolation\Status $status = null
    ) {
        $this->labeledThingId   = (string) $labeledThingId;
        $this->algorithm        = (string) $algorithm;
        $this->startFrameIndex = $frameRange->getStartFrameIndex();
        $this->endFrameIndex   = $frameRange->getEndFrameIndex();

        if ($status !== null) {
            $this->statusId = $status->getId();
        }
    }

    /**
     * @return string
     */
    public function getLabeledThingId()
    {
        return $this->labeledThingId;
    }

    /**
     * @return string
     */
    public function getAlgorithm()
    {
        return $this->algorithm;
    }

    /**
     * @return Model\FrameIndexRange
     */
    public function getFrameRange()
    {
        return new Model\FrameIndexRange($this->startFrameIndex, $this->endFrameIndex);
    }

    /**
     * @return string|null
     */
    public function getStatusId()
    {
        return $this->statusId;
    }
}