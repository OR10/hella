<?php
namespace Hagl\WorkerPoolBundle\Command;

use crosscan\WorkerPool\AMQP;
use PhpAmqpLib\Channel;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class Setup extends Command
{
    /**
     * @var AMQP\AMQPPoolConfig
     */
    private $config;

    /**
     * @var string
     */
    private $queuePrefix;

    /**
     * Setup constructor.
     *
     * @param AMQP\AMQPPoolConfig $config
     * @param string              $queuePrefix
     */
    public function __construct(AMQP\AMQPPoolConfig $config, string $queuePrefix)
    {
        parent::__construct('hagl:workerpool:setup');

        $this->config      = $config;
        $this->queuePrefix = $queuePrefix;
    }

    protected function configure()
    {
        $this->setDescription('Setup the RabbitMQ queues used by the worker pool');

        $this->addOption('check-only', null, Input\InputOption::VALUE_NONE, 'Check only the status');
    }

    /**
     * @param Input\InputInterface   $input
     * @param Output\OutputInterface $output
     *
     * @return int|null|void
     */
    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $checkOnly = $input->getOption('check-only');
        $channel   = $this->config->openConnection()->channel();

        if (!$this->setupWorkerExchanges($checkOnly, $channel)) {
            return 1;
        }

        if (!$this->setupNotificationExchanges($checkOnly, $channel)) {
            return 1;
        }

        if (!$this->setupStaticWorkerQueues($checkOnly, $channel)) {
            return 1;
        }

        if (!$this->setupStaticNotificationQueues($checkOnly, $channel)) {
            return 1;
        }

        if (!$this->setupDynamicWorkerQueues($checkOnly, $channel)) {
            return 1;
        }

        if (!$this->setupDynamicNotificationQueues($checkOnly, $channel)) {
            return 1;
        }

        return 0;
    }

    /**
     * @param                     $checkOnly
     * @param Channel\AMQPChannel $channel
     *
     * @return bool
     */
    private function setupWorkerExchanges($checkOnly, Channel\AMQPChannel $channel)
    {
        $workerExchanges = [
            $this->getQueueName('worker.garbage-collection') => 'fanout',
            $this->getQueueName('worker.main.exchange')      => 'topic',
        ];

        if ($checkOnly) {
            return $this->checkAllExchangesExist($workerExchanges, $channel);
        }

        foreach ($workerExchanges as $exchange => $type) {
            $channel->exchange_declare($exchange, $type, false, true, false);
        }

        return true;
    }

    /**
     * @param string $name
     *
     * @return string
     */
    private function getQueueName(string $name): string
    {
        return sprintf('%s%s', $this->queuePrefix, $name);
    }

    /**
     * @param                     $checkOnly
     * @param Channel\AMQPChannel $channel
     *
     * @return bool
     */
    private function setupNotificationExchanges($checkOnly, Channel\AMQPChannel $channel)
    {
        $garbageCollectionNotification = $this->getQueueName('notification.garbage-collection');
        $rescheduleNotification        = $this->getQueueName('notification.reschedule');
        $mainNotification              = $this->getQueueName('notification.main.exchange');
        $publishNotification           = $this->getQueueName('notification.publish.exchange');

        if ($checkOnly) {
            return $this->checkAllExchangesExist(
                [
                    $garbageCollectionNotification => 'fanout',
                    $rescheduleNotification        => 'fanout',
                    $mainNotification              => 'topic',
                    $publishNotification           => 'fanout',
                ],
                $channel
            );
        }

        $channel->exchange_declare($garbageCollectionNotification, 'fanout', false, true, false);
        $channel->exchange_declare($rescheduleNotification, 'fanout', false, true, false);
        $channel->exchange_declare($publishNotification, 'fanout', false, true, false);
        $channel->exchange_declare(
            $mainNotification,
            'topic',
            false,
            true,
            false,
            false,
            false,
            [
                'alternate-exchange'     => ['S', $garbageCollectionNotification],
                'x-dead-letter-exchange' => ['S', $rescheduleNotification],
            ]
        );

        $channel->exchange_bind($mainNotification, $publishNotification);

        return true;
    }

    /**
     * @param                     $checkOnly
     * @param Channel\AMQPChannel $channel
     *
     * @return bool
     */
    private function setupStaticWorkerQueues($checkOnly, Channel\AMQPChannel $channel)
    {
        $rescheduleQueue30   = $this->getQueueName('worker.reschedule.30s');
        $rescheduleQueue60   = $this->getQueueName('worker.reschedule.60s');
        $rescheduleQueue300  = $this->getQueueName('worker.reschedule.300s');
        $rescheduleQueue900  = $this->getQueueName('worker.reschedule.900s');
        $highPriorityQueue   = $this->getQueueName('worker.queue.high_prio');
        $lowPriorityQueue    = $this->getQueueName('worker.queue.low_prio');
        $normalPriorityQueue = $this->getQueueName('worker.queue.normal_prio');
        $garbageCollection   = $this->getQueueName('worker.garbage-collection');
        $mainExchange        = $this->getQueueName('worker.main.exchange');

        if ($checkOnly) {
            return $this->checkAllQueuesExist(
                [
                    $rescheduleQueue30,
                    $rescheduleQueue60,
                    $rescheduleQueue300,
                    $rescheduleQueue900,
                    $highPriorityQueue,
                    $lowPriorityQueue,
                    $normalPriorityQueue,
                    $garbageCollection,
                ],
                $channel
            );
        }

        $channel->queue_declare($rescheduleQueue30, false, true, false, false);
        $channel->queue_declare($rescheduleQueue60, false, true, false, false);
        $channel->queue_declare($rescheduleQueue300, false, true, false, false);
        $channel->queue_declare($rescheduleQueue900, false, true, false, false);

        $channel->queue_declare($highPriorityQueue, false, true, false, false);
        $channel->queue_bind($highPriorityQueue, $mainExchange, $this->getQueueName('worker.queue.high_prio.#'));

        $channel->queue_declare($lowPriorityQueue, false, true, false, false);
        $channel->queue_bind($lowPriorityQueue, $mainExchange, $this->getQueueName('worker.queue.low_prio.#'));

        $channel->queue_declare($normalPriorityQueue, false, true, false, false);
        $channel->queue_bind($normalPriorityQueue, $mainExchange, $this->getQueueName('worker.queue.normal_prio.#'));

        $channel->queue_declare($garbageCollection, false, true, false, false);
        $channel->queue_bind($garbageCollection, $garbageCollection);

        return true;
    }

    /**
     * @param                     $checkOnly
     * @param Channel\AMQPChannel $channel
     *
     * @return bool
     */
    private function setupStaticNotificationQueues($checkOnly, Channel\AMQPChannel $channel)
    {
        $rescheduleNotification        = $this->getQueueName('notification.reschedule');
        $garbageCollectionNotification = $this->getQueueName('notification.garbage-collection');
        $catchAllNotification          = $this->getQueueName('catch ALL the notifications o/');
        $publishNotification           = $this->getQueueName('notification.publish.exchange');

        if ($checkOnly) {
            return $this->checkAllQueuesExist(
                [$rescheduleNotification, $garbageCollectionNotification, $catchAllNotification],
                $channel
            );
        }

        $channel->queue_declare($rescheduleNotification, false, true, false, false);
        $channel->queue_bind($rescheduleNotification, $rescheduleNotification);

        $channel->queue_declare($garbageCollectionNotification, false, true, false, false);
        $channel->queue_bind($garbageCollectionNotification, $garbageCollectionNotification);

        $channel->queue_declare($catchAllNotification, false, true, false, false);
        $channel->queue_bind($catchAllNotification, $publishNotification, '#');

        return true;
    }

    /**
     * @param                     $checkOnly
     * @param Channel\AMQPChannel $channel
     *
     * @return bool
     */
    private function setupDynamicWorkerQueues($checkOnly, Channel\AMQPChannel $channel)
    {
        // nothing to do here yet
        return true;
    }

    /**
     * @param                     $checkOnly
     * @param Channel\AMQPChannel $channel
     *
     * @return bool
     */
    private function setupDynamicNotificationQueues($checkOnly, Channel\AMQPChannel $channel)
    {
        $queues = [];

        if ($checkOnly) {
            return $this->checkAllQueuesExist($queues, $channel);
        }

        $mainNotificationExchange = $this->getQueueName('notification.main.exchange');

        foreach ($queues as $queue => $routingKey) {
            $channel->queue_declare($queue, false, true, false, false);
            $channel->queue_bind($queue, $mainNotificationExchange, $routingKey);
        }

        return true;
    }

    /**
     * @param                     $exchange
     * @param                     $exchangeType
     * @param Channel\AMQPChannel $channel
     *
     * @return bool
     */
    private function exchangeExists($exchange, $exchangeType, Channel\AMQPChannel $channel)
    {
        try {
            $channel->exchange_declare($exchange, $exchangeType, true, true, false);

            return true;
        } catch (\Exception $ignore) {
            return false;
        }
    }

    /**
     * Checks if all of the given exchanges exist.
     *
     * @param array               $exchanges
     * @param Channel\AMQPChannel $channel
     *
     * @return bool
     */
    private function checkAllExchangesExist(array $exchanges, Channel\AMQPChannel $channel)
    {
        foreach ($exchanges as $exchange => $type) {
            if (!$this->exchangeExists($exchange, $type, $channel)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param                     $queue
     * @param Channel\AMQPChannel $channel
     *
     * @return bool
     */
    private function queueExists($queue, Channel\AMQPChannel $channel)
    {
        try {
            $channel->queue_declare($queue, true, true, false, false);

            return true;
        } catch (\Exception $ignore) {
            return false;
        }
    }

    /**
     * Checks if all of the given queues exist.
     *
     * @param array               $queues
     * @param Channel\AMQPChannel $channel
     *
     * @return bool
     */
    private function checkAllQueuesExist(array $queues, Channel\AMQPChannel $channel)
    {
        foreach ($queues as $queue) {
            if (!$this->queueExists($queue, $channel)) {
                return false;
            }
        }

        return true;
    }
}
