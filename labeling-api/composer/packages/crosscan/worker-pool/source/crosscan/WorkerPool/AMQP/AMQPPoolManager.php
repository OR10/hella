<?php

namespace crosscan\WorkerPool\AMQP;

use PhpAmqpLib\Channel;

class AMQPPoolManager
{
    /**
     * @var AMQPPoolConfig
     */
    private $amqpConfig;

    /**
     * @param AMQPPoolConfig $config the config for this pool
     */
    public function __construct(AMQPPoolConfig $config)
    {
        $this->amqpConfig = $config;
    }

    /**
     * initializes the this pool. Its safe to call it often.
     */
    public function init()
    {
        $this->configureAMQPQueues();
    }

    private function configureAMQPQueues()
    {
        $channel = $this->amqpConfig->openConnection()->channel();
        $this->declareMainExchange($channel);

        $this->declareQueue($channel, $this->amqpConfig->workerHighPrioRoutingKey);
        $this->declareQueue($channel, $this->amqpConfig->workerNormalPrioRoutingKey);
        $this->declareQueue($channel, $this->amqpConfig->workerLowPrioRoutingKey);
    }

    private function declareQueue(Channel\AMQPChannel $channel, $queueName)
    {
        $channel->queue_declare($queueName, false, true, false, false);
        $channel->queue_bind($queueName, $this->amqpConfig->workerMainExchange, $queueName . '.#');
    }

    private function declareMainExchange(Channel\AMQPChannel $channel)
    {
        $args = array();

        if ($this->amqpConfig->useAlternateExchange) {
            $channel->exchange_declare($this->amqpConfig->workerAlternateExchange, 'fanout', false, true, false);
        }
        if ($this->amqpConfig->useDeadLetterExchange) {
            $channel->exchange_declare($this->amqpConfig->workerDeadLetterExchange, 'fanout', false, true, false);
            $channel->queue_declare('monitoringQueue', false, true, false, false);
            $channel->queue_bind('monitoringQueue', $this->amqpConfig->workerDeadLetterExchange);
        }

        $channel->exchange_declare($this->amqpConfig->rescheduleQueue, 'fanout', false, true, false);
        $channel->queue_declare($this->amqpConfig->rescheduleQueue, false, true, false, false);
        $channel->queue_bind($this->amqpConfig->rescheduleQueue, $this->amqpConfig->rescheduleQueue);

        $channel->exchange_declare(
            $this->amqpConfig->workerMainExchange,
            'topic',
            false,
            true,
            false,
            false,
            false,
            $args
        );
    }

    private function loadConfig()
    {
        $this->amqpConfig = include __DIR__ . '/config.inc.php';
    }
}
