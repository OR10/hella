<?php


class PreConditionTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var \crosscan\WorkerPool\JobInstructionFactory
     */
    private $jobInstructionFactory;

    /**
     * @var \crosscan\Logger\Facade\LoggerFacade
     */
    private $loggerFacade;

    public function setUp()
    {
        $this->loggerFacade = new crosscan\Logger\Facade\LoggerFacade(
            new \cscntLogger(),
            'workerpool-tests'
        );

        $this->preConditionJob                    = \Phake::mock('crosscan\WorkerPool\Job\PreConditionVerifier');
        $this->jobInstructionFactory              = \Phake::mock('crosscan\WorkerPool\JobInstructionFactory');
        $this->innerJob                           = new \crosscan\WorkerPool\Job\TestJob();
        $this->testJobInstruction                 = new \crosscan\WorkerPool\Instruction\TestJobOutputter();
        $this->preConditionVerifierInstruction    = \Phake::partialMock(
            'crosscan\WorkerPool\Instruction\PreConditionVerifier',
            $this->jobInstructionFactory
        );

        \Phake::when($this->jobInstructionFactory)->getInstructionForJob($this->preConditionJob)->thenReturn($this->preConditionVerifierInstruction);
        \Phake::when($this->jobInstructionFactory)->getInstructionForJob($this->innerJob)->thenReturn($this->testJobInstruction);
        \Phake::when($this->preConditionJob)->__get('job')->thenReturn($this->innerJob);
    }

    public function testSuccessfulPrecondition()
    {
        $this->fulfillPrecondition();

        $this->runJob();

        $this->assertEquals(
            'Hallo Welt',
            file_get_contents($this->innerJob->filename),
            'Job was not executed, thus the tempfile was not written'
        );
    }

    public function testRescheduledPrecondition()
    {
        $this->fulfillPrecondition(false);
        $this->discardJobIfPreConditionNotFulfilled(false);

        try {
            $this->runJob();
            $this->fail('Job was executed with throwing an exception!');
        } catch(\crosscan\WorkerPool\Exception $e) {
            $this->assertSame('Precondition not fulfilled!', $e->getMessage());
            $this->assertSame('', file_get_contents($this->innerJob->filename), 'Job was executed, tempfile is not empty.');
        }
    }

    public function testDiscardPrecondition()
    {
        $this->fulfillPrecondition(false);
        $this->discardJobIfPreConditionNotFulfilled();

        $this->assertSame('', file_get_contents($this->innerJob->filename), 'Job was executed, tempfile is not empty.');
    }


    private function runJob()
    {
        $this->jobInstructionFactory->getInstructionForJob($this->preConditionJob)->run(
            $this->preConditionJob,
            $this->loggerFacade
        );
    }

    private function fulfillPrecondition($state = true)
    {
        \Phake::when($this->preConditionVerifierInstruction)->isPreconditionFulfilled($this->preConditionJob)->thenReturn($state);
    }


    private function discardJobIfPreConditionNotFulfilled($state = true)
    {
        \Phake::when($this->preConditionVerifierInstruction)->discardJobIfPreConditionNotFulfilled()->thenReturn($state);
    }

}
