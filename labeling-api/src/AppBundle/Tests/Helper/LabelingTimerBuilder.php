<?php

namespace AppBundle\Tests\Helper;

use AppBundle\Model;

/**
 * Helper class to create LabelingTimer.
 */
class LabelingTimerBuilder
{
    /**
     * @var Model\LabelingTask
     */
    private $labelingTask;

    /**
     * @var Model\User
     */
    private $user;

    /**
     * @var int
     */
    private $timeInSeconds = 0;

    /**
     * @var string
     */
    private $phase = Model\LabelingTask::PHASE_LABELING;

    /**
     * Declare a private constructor to enforce usage of fluent interface.
     */
    private function __construct()
    {
    }

    /**
     * @return LabelingTimerBuilder
     */
    public static function create()
    {
        return new self();
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return $this
     */
    public function withTask(Model\LabelingTask $task)
    {
        $this->labelingTask = $task;

        return $this;
    }

    /**
     * @param Model\User $user
     *
     * @return $this
     */
    public function withUser(Model\User $user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * @param int $timeInSeconds
     *
     * @return $this
     */
    public function withTimeInSeconds(int $timeInSeconds)
    {
        $this->timeInSeconds = $timeInSeconds;

        return $this;
    }

    /**
     * @param string $phase
     *
     * @return $this
     */
    public function withPhase(string $phase)
    {
        $this->phase = $phase;

        return $this;
    }

    /**
     * @return Model\TaskTimer
     */
    public function build()
    {
        $timer = new Model\TaskTimer($this->labelingTask, $this->user);
        $timer->setTimeInSeconds($this->phase, $this->timeInSeconds);

        return $timer;
    }
}