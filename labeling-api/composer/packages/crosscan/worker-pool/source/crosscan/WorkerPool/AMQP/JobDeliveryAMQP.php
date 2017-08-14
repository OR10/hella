<?php

namespace crosscan\WorkerPool\AMQP;

use PhpAmqpLib\Channel;
use PhpAmqpLib\Message;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Exception;

class JobDeliveryAMQP extends WorkerPool\JobDelivery
{
    /**
     * @var WorkerPool\Job
     */
    private $job;
    private $queue;
    private $deliveryTag;

    private $channel;

    /**
     * @param Message\AMQPMessage   $message The message that was consumed
     * @param string                $queue   The name of the queue from which the $message was consumed
     * @param Channel\AMQPChannel   $channel The channel through which the $message was consumed
     * @param WorkerPool\Serializer $serializer
     *
     * @throws WorkerPool\AMQP\Exception\AmqpMessageUnserializeFailed
     */
    public function __construct(
        Message\AMQPMessage $message,
        $queue,
        Channel\AMQPChannel $channel,
        WorkerPool\Serializer $serializer
    )
    {
        $this->queue       = $queue;
        $this->deliveryTag = $message->get("delivery_tag");
        $this->channel     = $channel;
        try {
            $this->job = $serializer->unserialize($message->body);
        } catch (Exception\UnserializeFailed $e) {
            throw new WorkerPool\AMQP\Exception\AmqpMessageUnserializeFailed($message, $channel);
        }

    }

    /**
     * @return Job the from the consumed $message
     */
    public function getJob()
    {
        return $this->job;
    }

    /**
     * ack signalizes the backend that the job represented by this delivery was processed successfully.
     *
     * @return void
     */
    public function ack()
    {
        $this->channel->basic_ack($this->deliveryTag);
    }

    /**
     * nack signalized the backend that the job represented by thie delivery was not proccessed successuflly and should
     * be scheduled for a later delivery again.
     *
     * @return void
     */
    public function nack()
    {
        $this->channel->basic_nack($this->deliveryTag, false, true);
    }
}
