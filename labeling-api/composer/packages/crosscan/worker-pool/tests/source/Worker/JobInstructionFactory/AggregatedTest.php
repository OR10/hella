<?php


namespace crosscan\WorkerPool\Tests\JobInstructionFactory;


class AggregatedTest extends \PHPUnit_Framework_TestCase
{
    public function testEmptySupportsFalse()
    {
        $factory = new \crosscan\WorkerPool\JobInstructionFactory\Aggregated(array());

        $this->assertFalse(
            $factory->supports(new \crosscan\WorkerPool\Job\TestJob())
        );
    }

    /**
     * @expectedException        \crosscan\WorkerPool\Exception
     * @expectedExceptionMessage Could not find a Job Instruction for crosscan\WorkerPool\Job\TestJob
     */
    public function testExceptionOnMissingInstructionFactory()
    {
        $factory = new \crosscan\WorkerPool\JobInstructionFactory\Aggregated(array());
        $factory->getInstructionForJob(new \crosscan\WorkerPool\Job\TestJob());
    }

    public function testSingleFactorySupportsTrue()
    {
        $factory = new \crosscan\WorkerPool\JobInstructionFactory\Aggregated(
            array(
                new \crosscan\WorkerPool\JobInstructionFactory\MappingWithCreateInstance(
                    array(
                        'crosscan\WorkerPool\Job\TestJob' => 'crosscan\WorkerPool\Instruction\TestJobOutputter'
                    )
                )
            )
        );

        $this->assertTrue(
            $factory->supports(new \crosscan\WorkerPool\Job\TestJob())
        );
    }

    public function testThirdFactorySupportsTrue()
    {
        $factory = new \crosscan\WorkerPool\JobInstructionFactory\Aggregated(
            array(
                new \crosscan\WorkerPool\JobInstructionFactory\MappingWithCreateInstance(array()),
                new \crosscan\WorkerPool\JobInstructionFactory\MappingWithCreateInstance(array()),
                new \crosscan\WorkerPool\JobInstructionFactory\MappingWithCreateInstance(
                    array(
                        'crosscan\WorkerPool\Job\TestJob' => 'crosscan\WorkerPool\Instruction\TestJobOutputter'
                    )
                )
            )
        );

        $this->assertTrue(
            $factory->supports(new \crosscan\WorkerPool\Job\TestJob())
        );
    }

    public function testThirdFactoryCreatesInstance()
    {
        $factory = new \crosscan\WorkerPool\JobInstructionFactory\Aggregated(
            array(
                new \crosscan\WorkerPool\JobInstructionFactory\MappingWithCreateInstance(array()),
                new \crosscan\WorkerPool\JobInstructionFactory\MappingWithCreateInstance(array()),
                new \crosscan\WorkerPool\JobInstructionFactory\MappingWithCreateInstance(
                    array(
                        'crosscan\WorkerPool\Job\TestJob' => 'crosscan\WorkerPool\Instruction\TestJobOutputter'
                    )
                )
            )
        );

        $this->assertInstanceOf(
            'crosscan\WorkerPool\Instruction\TestJobOutputter',
            $factory->getInstructionForJob(new \crosscan\WorkerPool\Job\TestJob())
        );
    }
}
