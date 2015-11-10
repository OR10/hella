<?php

namespace AppBundle\Worker\JobInstructionFactory;

use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use Symfony\Component\DependencyInjection;

class ServicesInstances extends WorkerPool\JobInstructionFactory
{
    /**
     * @var array
     */
    private $jobToInstructionMapping;

    /**
     * @var DependencyInjection\ContainerInterface
     */
    private $container;


    /**
     * ServicesInstances constructor.
     * @param array                                  $jobToInstructionMapping
     * @param DependencyInjection\ContainerInterface $container
     */
    public function __construct(array $jobToInstructionMapping, DependencyInjection\ContainerInterface $container)
    {
        $this->jobToInstructionMapping = $jobToInstructionMapping;
        $this->container               = $container;
    }

    /**
     * @param Job $job
     * @return object
     * @throws WorkerPool\Exception
     */
    public function getInstructionForJob(WorkerPool\Job $job)
    {
        $jobInstructionServiceId = $this->getInstructionClassForJob($job);

        return $this->container->get($jobInstructionServiceId);
    }

    /**
     * @param Job $job
     * @return mixed
     * @throws WorkerPool\Exception
     */
    private function getInstructionClassForJob(WorkerPool\Job $job)
    {
        $class = get_class($job);

        if (isset($this->jobToInstructionMapping[$class])) {
            return $this->jobToInstructionMapping[$class];
        }

        throw new WorkerPool\Exception("Could not find a Job Instruction for " . $class);
    }

    /**
     * @param Job $job
     * @return bool
     */
    function supports(Job $job)
    {
        return isset($this->jobToInstructionMapping[get_class($job)]);
    }
}
