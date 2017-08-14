<?php

namespace crosscan\WorkerPool\AMQP;

use crosscan\Logger\Facade;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Serializer;
use PhpAmqpLib\Channel;
use PhpAmqpLib\Message;
use crosscan\Std;

class FacadeAMQP extends WorkerPool\Facade
{
    /**
     * @var AMQPPoolConfig
     */
    private $amqpPoolConfig;

    private $prioToRoutingKeyMapping = array();

    private $publishChannel;
    /**
     * @var WorkerPool\Serializer
     */
    private $serializer;

    public function __construct(
        AMQPPoolConfig $config,
        \cscntLogger $logger,
        Serializer $serializer = null,
        WorkerPool\EventHandler $eventHandler = null
    )
    {
        $this->amqpPoolConfig = $config;
        $this->loggerFacade   = new Facade\LoggerFacade($logger, \cscntLogFacility::WORKER_POOL);
        $this->serializer     = $serializer !== null ? $serializer : new Serializer\PhpSerialize();
        $this->eventHandler   = $eventHandler === null ? new WorkerPool\EventHandler\NoOp() : $eventHandler;

        $this->prioToRoutingKeyMapping = array(
            WorkerPool\Facade::NORMAL_PRIO => $config->workerNormalPrioRoutingKey,
            WorkerPool\Facade::HIGH_PRIO   => $config->workerHighPrioRoutingKey,
            WorkerPool\Facade::LOW_PRIO    => $config->workerLowPrioRoutingKey,
        );
    }

    /**
     * Adds a Job to the WorkerPool.
     *
     * @param WorkerPool\Job $job the job to be done
     * @param string         $priority the priority of the job
     */
    public function addJob(WorkerPool\Job $job, $priority = WorkerPool\Facade::NORMAL_PRIO)
    {
        if (!$job->originallyCreated instanceof \DateTime) {
            $job->originallyCreated = new \DateTime();
        }

        if (!$job->hasUuid()) {
            $job->setUuid(new Std\UUID());
        }

        $this->eventHandler->jobScheduled($job);

        $job->priority = $priority;
        $message       = new Message\AMQPMessage(
            $this->serializer->serialize($job),
            array('delivery_mode' => 2) // make message persistent
        );

        $routingKey = $this->createRoutingKey($priority, $job);

        $this->getChannel()->basic_publish($message, $this->amqpPoolConfig->workerMainExchange, $routingKey);
    }

    /**
     * Should not be used
     *
     * This function is for internal usage within the WorkerPool
     * @internal
     * @return WorkerPool\EventHandler
     */
    public function getEventHandler()
    {
        return $this->eventHandler;
    }

    private function getChannel()
    {
        if ($this->publishChannel === null) {
            $this->publishChannel = $this->amqpPoolConfig->openConnection()->channel();
        }

        return $this->publishChannel;
    }

    private function createRoutingKey($priority, WorkerPool\Job $job)
    {
        if (!array_key_exists($priority, $this->prioToRoutingKeyMapping)) {
            throw new \InvalidArgumentException(sprintf('Priority \'%s\': is unknown', $priority));
        }

        $routingKeyPrefix = $this->prioToRoutingKeyMapping[$priority];

        return sprintf('%s.%s', $routingKeyPrefix, get_class($job));
    }
}
