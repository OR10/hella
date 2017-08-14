<?php

namespace crosscan\WorkerPool\AMQP\Exception;

use \crosscan\WorkerPool\Exception;
use PhpAmqpLib\Channel\AMQPChannel;
use PhpAmqpLib\Message\AMQPMessage;

/**
 * A unserializable AMQP messages was consumed
 *
 * Sadly, we need the AMQP Channel here in order to ACK the message :-(
 */
class AmqpMessageUnserializeFailed extends Exception\UnserializeFailed
{
    /**
     * @var AMQPMessage
     */
    private $AMQPMessage;
    /**
     * @var AMQPChannel
     */
    private $channel;

    public function __construct(AMQPMessage $AMQPMessage, AMQPChannel $channel)
    {
        parent::__construct($AMQPMessage->body);
        $this->AMQPMessage = $AMQPMessage;
        $this->channel = $channel;
    }

    /**
     * @return AMQPChannel
     */
    public function getChannel()
    {
        return $this->channel;
    }

    /**
     * @return AMQPMessage
     */
    public function getAMQPMessage()
    {
        return $this->AMQPMessage;
    }
}
