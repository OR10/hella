<?php

namespace crosscan\WorkerPool\Tests\JobInstructionFactory;


class MappingWithCreateInstanceTest extends \PHPUnit_Framework_TestCase
{
    public function testEmptySuppportsFalse()
    {
        $factory = new \crosscan\WorkerPool\JobInstructionFactory\MappingWithCreateInstance(array());
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
        $factory = new \crosscan\WorkerPool\JobInstructionFactory\MappingWithCreateInstance(array());
        $factory->getInstructionForJob(new \crosscan\WorkerPool\Job\TestJob());
    }

    public function testSupportsTrue()
    {
        $factory = new \crosscan\WorkerPool\JobInstructionFactory\MappingWithCreateInstance(array(
            'crosscan\WorkerPool\Job\TestJob' => 'crosscan\WorkerPool\Instruction\TestJobOutputter'
        ));
        
        $this->assertTrue(
            $factory->supports(new \crosscan\WorkerPool\Job\TestJob())
        );
    }

    public function testGetInstruction()
    {
        $factory = new \crosscan\WorkerPool\JobInstructionFactory\MappingWithCreateInstance(array(
            'crosscan\WorkerPool\Job\TestJob' => 'crosscan\WorkerPool\Instruction\TestJobOutputter'
        ));

        $this->assertInstanceOf(
            'crosscan\WorkerPool\Instruction\TestJobOutputter',
            $factory->getInstructionForJob(new \crosscan\WorkerPool\Job\TestJob())
        );
    }

}
