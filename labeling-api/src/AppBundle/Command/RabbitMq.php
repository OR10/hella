<?php
namespace AppBundle\Command;

use AnnoStationBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use crosscan\WorkerPool\JobInstructionFactory;
use crosscan\Logger\Facade;
use PhpAmqpLib\Channel;

class RabbitMq extends Base
{
    /**
     * @var AMQP\AMQPPoolConfig
     */
    private $AMQPPoolConfig;

    /**
     * @var string
     */
    private $queuePrefix;

    public function __construct(Service\AMQPPoolConfig $AMQPPoolConfig, string $queuePrefix)
    {
        parent::__construct();

        $this->AMQPPoolConfig = $AMQPPoolConfig;
        $this->queuePrefix    = $queuePrefix;
    }

    protected function configure()
    {
        $this->setName('annostation:rabbitmq:setup')
            ->setDescription('RabbitMQ setup the queues')
            ->addArgument('checkOnly', Input\InputArgument::OPTIONAL, 'Check only the status', false);
    }

    /**
     * @param Input\InputInterface   $input
     * @param Output\OutputInterface $output
     */
    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $checkOnly = $input->getArgument('checkOnly');
        $channel   = $this->AMQPPoolConfig->openConnection()->channel();

        $ok = true;

        $ok = $ok
            && $this->setupWorkerExchanges(
                $checkOnly,
                $channel
            );
        $ok = $ok
            && $this->setupNotificationExchanges(
                $checkOnly,
                $channel
            );
        $ok = $ok
            && $this->setupStaticWorkerQueues(
                $checkOnly,
                $channel
            );
        $ok = $ok
            && $this->setupStaticNotificationQueues(
                $checkOnly,
                $channel
            );
        $ok = $ok
            && $this->setupDynamicWorkerQueues(
                $checkOnly,
                $channel
            );
        $ok = $ok
            && $this->setupDynamicNotificationQueues(
                $checkOnly,
                $channel
            );

        return $ok ? 0 : 1;
    }

    /**
     * @param                     $checkOnly
     * @param Channel\AMQPChannel $channel
     * @return bool
     */
    private function setupWorkerExchanges($checkOnly, Channel\AMQPChannel $channel)
    {
        if ($checkOnly) {
            return $this->exchangeExists(
                $this->getQueueName('worker.garbage-collection'),
                'fanout',
                $channel
            )
            && $this->exchangeExists(
                $this->getQueueName('worker.main.exchange'),
                'topic',
                $channel
            );
        }

        $channel->exchange_declare(
            $this->getQueueName('worker.garbage-collection'),
            'fanout',
            false,
            true,
            false
        );
        $channel->exchange_declare(
            $this->getQueueName('worker.main.exchange'),
            'topic',
            false,
            true,
            false
        );

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
     * @return bool
     */
    private function setupNotificationExchanges($checkOnly, Channel\AMQPChannel $channel)
    {
        if ($checkOnly) {
            return $this->exchangeExists(
                $this->getQueueName('notification.garbage-collection'),
                'fanout',
                $channel
            )
            && $this->exchangeExists(
                $this->getQueueName('notification.reschedule'),
                'fanout',
                $channel
            )
            && $this->exchangeExists(
                $this->getQueueName('notification.main.exchange'),
                'topic',
                $channel
            )
            && $this->exchangeExists(
                $this->getQueueName('notification.publish.exchange'),
                'fanout',
                $channel
            );
        }

        $channel->exchange_declare(
            $this->getQueueName('notification.garbage-collection'),
            'fanout',
            false,
            true,
            false
        );
        $channel->exchange_declare(
            $this->getQueueName('notification.reschedule'),
            'fanout',
            false,
            true,
            false
        );
        $channel->exchange_declare(
            $this->getQueueName('notification.publish.exchange'),
            'fanout',
            false,
            true,
            false
        );

        $args                           = array();
        $args['alternate-exchange']     = array('S', $this->getQueueName('notification.garbage-collection'));
        $args['x-dead-letter-exchange'] = array('S', $this->getQueueName('notification.reschedule'));
        $channel->exchange_declare(
            $this->getQueueName('notification.main.exchange'),
            'topic',
            false,
            true,
            false,
            false,
            false,
            $args
        );

        $channel->exchange_bind(
            $this->getQueueName('notification.main.exchange'),
            $this->getQueueName('notification.publish.exchange')
        );

        return true;
    }

    /**
     * @param                     $checkOnly
     * @param Channel\AMQPChannel $channel
     * @return bool
     */
    private function setupStaticWorkerQueues($checkOnly, Channel\AMQPChannel $channel)
    {
        if ($checkOnly) {
            return $this->queueExists(
                $this->getQueueName('worker.reschedule.30s'),
                $channel
            )
            && $this->queueExists(
                $this->getQueueName('worker.reschedule.60s'),
                $channel
            )
            && $this->queueExists(
                $this->getQueueName('worker.reschedule.300s'),
                $channel
            )
            && $this->queueExists(
                $this->getQueueName('worker.reschedule.900s'),
                $channel
            )
            && $this->queueExists(
                $this->getQueueName('worker.queue.high_prio'),
                $channel
            )
            && $this->queueExists(
                $this->getQueueName('worker.queue.low_prio'),
                $channel
            )
            && $this->queueExists(
                $this->getQueueName('worker.queue.normal_prio'),
                $channel
            )
            && $this->queueExists(
                $this->getQueueName('worker.garbage-collection'),
                $channel
            );
        }

        $channel->queue_declare(
            $this->getQueueName('worker.reschedule.30s'),
            false,
            true,
            false,
            false
        );
        $channel->queue_declare(
            $this->getQueueName('worker.reschedule.60s'),
            false,
            true,
            false,
            false
        );
        $channel->queue_declare(
            $this->getQueueName('worker.reschedule.300s'),
            false,
            true,
            false,
            false
        );
        $channel->queue_declare(
            $this->getQueueName('worker.reschedule.900s'),
            false,
            true,
            false,
            false
        );

        $channel->queue_declare(
            $this->getQueueName('worker.queue.high_prio'),
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            $this->getQueueName('worker.queue.high_prio'),
            $this->getQueueName('worker.main.exchange'),
            $this->getQueueName('worker.queue.high_prio.#')
        );
        $channel->queue_declare(
            $this->getQueueName('worker.queue.low_prio'),
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            $this->getQueueName('worker.queue.low_prio'),
            $this->getQueueName('worker.main.exchange'),
            $this->getQueueName('worker.queue.low_prio.#')
        );
        $channel->queue_declare(
            $this->getQueueName('worker.queue.normal_prio'),
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            $this->getQueueName('worker.queue.normal_prio'),
            $this->getQueueName('worker.main.exchange'),
            $this->getQueueName('worker.queue.normal_prio.#')
        );

        $channel->queue_declare(
            $this->getQueueName('worker.garbage-collection'),
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            $this->getQueueName('worker.garbage-collection'),
            $this->getQueueName('worker.garbage-collection')
        );

        return true;
    }

    /**
     * @param                     $checkOnly
     * @param Channel\AMQPChannel $channel
     * @return bool
     */
    private function setupStaticNotificationQueues($checkOnly, Channel\AMQPChannel $channel)
    {
        if ($checkOnly) {
            return $this->queueExists(
                $this->getQueueName('notification.reschedule'),
                $channel
            )
            && $this->queueExists(
                $this->getQueueName('notification.garbage-collection'),
                $channel
            )
            && $this->queueExists(
                $this->getQueueName('catch ALL the notifications o/'),
                $channel
            );
        }

        $channel->queue_declare(
            $this->getQueueName('notification.reschedule'),
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            $this->getQueueName('notification.reschedule'),
            $this->getQueueName('notification.reschedule')
        );

        $channel->queue_declare(
            $this->getQueueName('notification.garbage-collection'),
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            $this->getQueueName('notification.garbage-collection'),
            $this->getQueueName('notification.garbage-collection')
        );

        $channel->queue_declare(
            $this->getQueueName('catch ALL the notifications o/'),
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            $this->getQueueName('catch ALL the notifications o/'),
            $this->getQueueName('notification.publish.exchange'),
            '#'
        );

        return true;
    }

    /**
     * @param                     $checkOnly
     * @param Channel\AMQPChannel $channel
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
     * @return bool
     */
    private function setupDynamicNotificationQueues($checkOnly, Channel\AMQPChannel $channel)
    {
        $queues = array();

        $ok = true;

        foreach ($queues as $queue => $routingKey) {
            if ($checkOnly) {
                $ok &= $this->queueExists(
                    $queue,
                    $channel
                );
                continue;
            }

            $channel->queue_declare(
                $queue,
                false,
                true,
                false,
                false
            );
            $channel->queue_bind(
                $queue,
                $this->getQueueName('notification.main.exchange'),
                $routingKey
            );
        }

        return $ok;
    }

    /**
     * @param                     $exchange
     * @param                     $exchangeType
     * @param Channel\AMQPChannel $channel
     * @return bool
     */
    private function exchangeExists($exchange, $exchangeType, Channel\AMQPChannel $channel)
    {
        try {
            $channel->exchange_declare(
                $exchange,
                $exchangeType,
                true,
                true,
                false
            );

            return true;
        } catch (\Exception $ignore) {
            return false;
        }
    }

    /**
     * @param                     $queue
     * @param Channel\AMQPChannel $channel
     * @return bool
     */
    private function queueExists($queue, Channel\AMQPChannel $channel)
    {
        try {
            $channel->queue_declare(
                $queue,
                true,
                true,
                false,
                false
            );

            return true;
        } catch (\Exception $ignore) {
            return false;
        }
    }
}
