<?php

namespace crosscan\WorkerPool;

use crosscan\WorkerPool\AMQP;
use PhpAmqpLib\Channel;
use PhpAmqpLib\Message;
use PhpAmqpLib\Exception;

class JobRescheduler
{
    /**
     * @var Channel\AMQPChannel|null
     */
    private $channel;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $workerPoolFacade;

    /**
     * @var AMQP\AMQPPoolConfig
     */
    private $AMQPPoolConfig;

    /**
     * @var bool
     */
    private $isShuttingDown = false;

    /**
     * @var array
     */
    private $handledJobs = array();

    /**
     * @param AMQP\FacadeAMQP     $workerPoolFacade
     * @param AMQP\AMQPPoolConfig $AMQPPoolConfig
     */
    public function __construct(
        AMQP\FacadeAMQP $workerPoolFacade,
        AMQP\AMQPPoolConfig $AMQPPoolConfig
    ) {
        $this->workerPoolFacade = $workerPoolFacade;
        $this->AMQPPoolConfig   = $AMQPPoolConfig;
    }

    /**
     * Dispatch to the AMQP channel
     *
     * @param $queue
     */
    public function run($queue)
    {
        $this->setUp($queue);
        try {
            while (true) {
                $this->channel->wait(
                    null,
                    true,
                    1
                );
            }
        } catch (Exception\AMQPTimeoutException $ignored) {
            $this->shutdown();
        }
    }

    /**
     * Setup the channel
     *
     * @param $queue
     */
    private function setUp($queue)
    {
        $this->channel = $this->AMQPPoolConfig->openConnection()->channel();

        $handlerName = md5(uniqid(microtime()));
        $thisHelper  = $this;
        $this->channel->basic_consume(
            $queue,
            $handlerName,
            false,
            false,
            true,
            false,
            function ($job) use ($thisHelper) {
                $thisHelper->handle($job);
            }
        );
        $this->channel->basic_qos(
            0,
            0,
            false
        );
    }

    /**
     * @param Message\AMQPMessage $message
     */
    private function handle(Message\AMQPMessage $message)
    {
        if ($this->isShuttingDown) {
            return;
        }
        $deliveryTag                     = $message->get('delivery_tag');
        $this->handledJobs[$deliveryTag] = unserialize($message->body);
    }

    /**
     * Shutdown the consumer and redeliver all jobs
     */
    public function shutdown()
    {
        $this->isShuttingDown = true;
        foreach ($this->handledJobs as $deliveryTag => $jobEnvelope) {
            if ($jobEnvelope instanceof AMQP\RescheduleMessage) {
                $job = $jobEnvelope->job;
            } else {
                $job = $jobEnvelope;
            }
            if ($job->priority === null) {
                $this->workerPoolFacade->addJob($job);
            } else {
                $this->workerPoolFacade->addJob(
                    $job,
                    $job->priority
                );
            }
            $this->channel->basic_ack($deliveryTag);
        }
        $this->handledJobs = array();
    }
}