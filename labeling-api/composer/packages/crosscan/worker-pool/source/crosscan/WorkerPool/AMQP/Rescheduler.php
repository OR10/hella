<?php

namespace crosscan\WorkerPool\AMQP;

use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use PhpAmqpLib\Channel;
use PhpAmqpLib\Message;

/**
 * Handles the Rescheduling of RescheduleMessages
 */
class Rescheduler extends WorkerPool\Rescheduler
{
    private $workerPoolFacade;
    private $queue;
    private $channel;

    /**
     * @var AMQP\RescheduleMessage[]
     */
    private $handledJobs = array();
    private $isShuttingDown = false;
    /**
     * @var WorkerPool\Serializer
     */
    private $serializer;

    public function __construct(
        Channel\AMQPChannel $channel,
        $queue,
        AMQP\FacadeAMQP $workerPoolFacade,
        WorkerPool\Serializer $serializer
    ) {
        $this->channel          = $channel;
        $this->workerPoolFacade = $workerPoolFacade;
        $this->queue            = $queue;
        $this->serializer = $serializer;
    }

    public function setUp()
    {
        $this->handlerName = md5(uniqid(microtime()));

        $this->isShuttingDown = false;
        $thisHelper           = $this;
        $this->channel->basic_consume(
            $this->queue,
            $this->handlerName,
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

    private function handle(Message\AMQPMessage $message)
    {
        if ($this->isShuttingDown) {
            return;
        }

        $deliveryTag = $message->get('delivery_tag');

        $this->handledJobs[$deliveryTag] = $this->serializer->unserializeRescheduleMessage($message->body);
    }

    public function shutdown()
    {
        $this->isShuttingDown = true;

        foreach ($this->handledJobs as $deliveryTag => $jobEnvelope) {

            if ($jobEnvelope instanceof \crosscan\WorkerPool\AMQP\RescheduleMessage) {
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
            $this->workerPoolFacade->getEventHandler()->jobRedeliveredAfterReschedule($job);
        }

        $this->handledJobs = array();
    }
}
