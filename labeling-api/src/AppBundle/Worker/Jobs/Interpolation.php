<?php
namespace AppBundle\Worker\Jobs;

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
    private $startFrameNumber;

    /**
     * @var int
     */
    private $endFrameNumber;

    /**
     * @var string
     */
    private $statusId;

    /**
     * @param string                          $labeledThingId
     * @param string                          $algorithm
     * @param Model\FrameRange                $frameRange
     * @param Model\Interpolation\Status|null $status
     */
    public function __construct(
        $labeledThingId,
        $algorithm,
        Model\FrameRange $frameRange,
        Model\Interpolation\Status $status = null
    ) {
        $this->labeledThingId   = (string) $labeledThingId;
        $this->algorithm        = (string) $algorithm;
        $this->startFrameNumber = $frameRange->getStartFrameNumber();
        $this->endFrameNumber   = $frameRange->getEndFrameNumber();

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
     * @return Model\FrameRange
     */
    public function getFrameRange()
    {
        return new Model\FrameRange($this->startFrameNumber, $this->endFrameNumber);
    }

    /**
     * @return string|null
     */
    public function getStatusId()
    {
        return $this->statusId;
    }
}
