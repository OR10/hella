<?php

namespace crosscan\RabbitMQ;

use PhpAmqpLib\Channel\AMQPChannel;

/**
 * Represents a queue. If it does not exist, it wont be created unless create() is called.
 *
 * @property-read string $name
 * @property-read bool   $isAutoDelete
 * @property-read bool   $isDurable
 *
 */
class Queue
{
    /**
     * @var string
     */
    private $name;

    /**
     * @var bool
     */
    private $isDurable;

    /**
     * @var bool
     */
    private $isAutoDelete;

    /**
     * @var array
     */
    private $bindings = array();

    /**
     * @param string $name
     * @param bool   $durable
     * @param bool   $autoDelete
     */
    public function __construct($name, $durable = true, $autoDelete = false)
    {
        $this->name         = (string) $name;
        $this->isAutoDelete = (bool) $autoDelete;
        $this->isDurable    = (bool) $durable;
    }

    /**
     * @param Exchange $otherExchange
     * @param string   $routingKey
     */
    public function addBinding(Exchange $exchange, $routingKey = '')
    {
        $this->bindings[] = array($exchange, (string) $routingKey);
    }

    /**
     * @param $name
     * @return mixed
     */
    public function __get($name)
    {
        return $this->$name;
    }

    /**
     * @param AMQPChannel $channel
     */
    public function create(AMQPChannel $channel)
    {
        $channel->queue_declare(
            $this->name,
            false,
            $this->isDurable,
            false,
            $this->isAutoDelete
        );

        $this->setUpBindings($channel);
    }

    /**
     * @param AMQPChannel $channel
     */
    private function setupBindings(AMQPChannel $channel)
    {
        foreach ($this->bindings as $binding) {
            list($exchange, $routingKey) = $binding;

            $exchange->create($channel);

            $channel->queue_bind($this->name, $exchange->name, $routingKey);
        }
    }
}
