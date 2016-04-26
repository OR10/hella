<?php

namespace AppBundle\Helper;

/**
 * Abstract interface to propagate ProgressInformation during long running operations
 */
abstract class ProgressIndicator {
    /**
     * Maximum number of steps until operation is finished
     * 
     * @var int
     */
    protected $numberOfSteps;

    /**
     * Current processed step
     * 
     * @var int
     */
    protected $currentStep;

    /**
     * Whether the indicator is currently running
     * 
     * @var bool
     */
    protected $running;
    
    public function __construct() {
        $this->numberOfSteps = 100;
        $this->currentStep = 0;
        $this->running = false;
    }

    /**
     * Start a new Progress run
     * 
     * @param int $numberOfSteps
     */
    public function start($numberOfSteps = 100) {
        if ($this->running === true) {
            $this->finish();
        }
        
        $this->running = true;
        $this->numberOfSteps = $numberOfSteps;
    }

    /**
     * Finish the current progress run
     */
    public function finish() {
        $this->running = false;
    }

    /**
     * Advance progress by n steps
     * 
     * @param int $step
     */
    public function advance($step = 1) {
        if ($this->currentStep + $step > $this->numberOfSteps) {
            throw new \RuntimeException('Progress exceeded declared maximum number of steps: ' . ($this->currentStep + $step) . ' > ' . $this->numberOfSteps);
        }
        
        $this->currentStep += $step;
    }
}