<?php

namespace crosscan\RabbitMQ;

use PhpAmqpLib\Channel\AMQPChannel;
use PhpAmqpLib\Exception\AMQPOutOfBoundsException;

/**
 * Represents an exchange. If it does not exist, it wont be created unless create() is called.
 *
 * @property-read string $name
 * @property-read bool   $isAutoDelete
 * @property-read bool   $isDurable
 *
 */
class Exchange
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
     * @var Exchange
     */
    private $alternateExchange;

    /**
     * @var Exchange
     */
    private $deadLetterExchange;

    /**
     * @var array
     */
    private $bindings = array();

    /**
     * @param string $name
     * @param string $type
     * @param bool   $durable
     * @param bool   $autoDelete
     */
    public function __construct($name, $type, $durable = true, $autoDelete = false)
    {
        $validTypes = array('fanout', 'topic');
        if (!in_array($type, $validTypes)) {
            throw new \InvalidArgumentException(
                sprintf(
                    'Invalid exchange type <%s>. Valid types are: %s',
                    $type,
                    implode(', ', $validTypes)
                )
            );
        }

        $this->name         = (string) $name;
        $this->type         = $type;
        $this->isAutoDelete = (bool) $autoDelete;
        $this->isDurable    = (bool) $durable;
    }

    /**
     * @param Exchange $otherExchange
     * @param string   $routingKey
     */
    public function addBinding(Exchange $otherExchange, $routingKey = '')
    {
        $this->bindings[] = array($otherExchange, (string) $routingKey);
    }

    /**
     * @param Exchange $exchange
     */
    public function setAlternateExchange(Exchange $exchange)
    {
        $this->alternateExchange = $exchange;
    }

    /**
     * @param Exchange $exchange
     */
    public function setDeadLetterExchange(Exchange $exchange)
    {
        $this->deadLetterExchange = $exchange;
    }

    /**
     * @param AMQPChannel $channel
     */
    public function create(AMQPChannel $channel)
    {
        if ($this->alternateExchange !== null) {
            $this->alternateExchange->create($channel);
        }

        if ($this->deadLetterExchange !== null) {
            $this->deadLetterExchange->create($channel);
        }

        $parameters = $this->createParameters();

        $channel->exchange_declare(
            $this->name,
            $this->type,
            false,
            $this->isDurable,
            $this->isAutoDelete,
            false,
            false,
            $parameters
        );

        $this->setUpBindings($channel);
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
     * @return array
     */
    private function createParameters()
    {
        $parameters = array();

        if ($this->deadLetterExchange !== null) {
            $parameters['x-dead-letter-exchange'] = array('S', $this->deadLetterExchange->name);
        }
        if ($this->alternateExchange !== null) {
            $parameters['alternate-exchange'] = array('S', $this->alternateExchange->name);
        }

        return empty($parameters) ? null : $parameters;
    }

    /**
     * @param AMQPChannel $channel
     */
    private function setUpBindings(AMQPChannel $channel)
    {
        foreach ($this->bindings as $binding) {
            list($otherExchange, $routingKey) = $binding;

            $otherExchange->create($channel);

            $channel->exchange_bind($this->name, $otherExchange->name, $routingKey);
        }
    }
}