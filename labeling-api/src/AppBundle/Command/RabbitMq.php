<?php
namespace AppBundle\Command;

use AppBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use crosscan\WorkerPool\JobInstructionFactory;
use crosscan\Logger\Facade;
use PhpAmqpLib\Channel;

class RabbitMq extends BaseCommand
{
    /**
     * @var AMQP\AMQPPoolConfig
     */
    private $AMQPPoolConfig;

    public function __construct(Service\AMQPPoolConfig $AMQPPoolConfig)
    {
        parent::__construct();
        $this->AMQPPoolConfig = $AMQPPoolConfig;
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

        if ($ok) {
            exit(0);
        }

        exit(1);
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
                'worker.garbage-collection',
                'fanout',
                $channel
            )
            && $this->exchangeExists(
                'worker.main.exchange',
                'topic',
                $channel
            );
        }

        $channel->exchange_declare(
            'worker.garbage-collection',
            'fanout',
            false,
            true,
            false
        );
        $channel->exchange_declare(
            'worker.main.exchange',
            'topic',
            false,
            true,
            false
        );

        return true;
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
                'notification.garbage-collection',
                'fanout',
                $channel
            )
            && $this->exchangeExists(
                'notification.reschedule',
                'fanout',
                $channel
            )
            && $this->exchangeExists(
                'notification.main.exchange',
                'topic',
                $channel
            )
            && $this->exchangeExists(
                'notification.publish.exchange',
                'fanout',
                $channel
            );
        }

        $channel->exchange_declare(
            'notification.garbage-collection',
            'fanout',
            false,
            true,
            false
        );
        $channel->exchange_declare(
            'notification.reschedule',
            'fanout',
            false,
            true,
            false
        );
        $channel->exchange_declare(
            'notification.publish.exchange',
            'fanout',
            false,
            true,
            false
        );

        $args                           = array();
        $args['alternate-exchange']     = array('S', 'notification.garbage-collection');
        $args['x-dead-letter-exchange'] = array('S', 'notification.reschedule');
        $channel->exchange_declare(
            'notification.main.exchange',
            'topic',
            false,
            true,
            false,
            false,
            false,
            $args
        );

        $channel->exchange_bind(
            'notification.main.exchange',
            'notification.publish.exchange'
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
                'worker.reschedule.30s',
                $channel
            )
            && $this->queueExists(
                'worker.reschedule.60s',
                $channel
            )
            && $this->queueExists(
                'worker.reschedule.300s',
                $channel
            )
            && $this->queueExists(
                'worker.reschedule.900s',
                $channel
            )
            && $this->queueExists(
                'worker.queue.high_prio',
                $channel
            )
            && $this->queueExists(
                'worker.queue.low_prio',
                $channel
            )
            && $this->queueExists(
                'worker.queue.normal_prio',
                $channel
            )
            && $this->queueExists(
                'worker.garbage-collection',
                $channel
            );
        }

        $channel->queue_declare(
            'worker.reschedule.30s',
            false,
            true,
            false,
            false
        );
        $channel->queue_declare(
            'worker.reschedule.60s',
            false,
            true,
            false,
            false
        );
        $channel->queue_declare(
            'worker.reschedule.300s',
            false,
            true,
            false,
            false
        );
        $channel->queue_declare(
            'worker.reschedule.900s',
            false,
            true,
            false,
            false
        );

        $channel->queue_declare(
            'worker.queue.high_prio',
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            'worker.queue.high_prio',
            'worker.main.exchange',
            'worker.queue.high_prio.#'
        );
        $channel->queue_declare(
            'worker.queue.low_prio',
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            'worker.queue.low_prio',
            'worker.main.exchange',
            'worker.queue.low_prio.#'
        );
        $channel->queue_declare(
            'worker.queue.normal_prio',
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            'worker.queue.normal_prio',
            'worker.main.exchange',
            'worker.queue.normal_prio.#'
        );

        $channel->queue_declare(
            'worker.garbage-collection',
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            'worker.garbage-collection',
            'worker.garbage-collection'
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
                'notification.reschedule',
                $channel
            )
            && $this->queueExists(
                'notification.garbage-collection',
                $channel
            )
            && $this->queueExists(
                'catch ALL the notifications o/',
                $channel
            );
        }

        $channel->queue_declare(
            'notification.reschedule',
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            'notification.reschedule',
            'notification.reschedule'
        );

        $channel->queue_declare(
            'notification.garbage-collection',
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            'notification.garbage-collection',
            'notification.garbage-collection'
        );

        $channel->queue_declare(
            'catch ALL the notifications o/',
            false,
            true,
            false,
            false
        );
        $channel->queue_bind(
            'catch ALL the notifications o/',
            'notification.publish.exchange',
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
                'notification.main.exchange',
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