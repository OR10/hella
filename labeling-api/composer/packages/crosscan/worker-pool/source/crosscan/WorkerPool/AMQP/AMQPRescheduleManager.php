<?php

namespace crosscan\WorkerPool\AMQP;

use crosscan\Logger\Facade;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Serializer;
use crosscan\WorkerPool\Exception;
use PhpAmqpLib\Message;

class AMQPRescheduleManager extends WorkerPool\RescheduleManager
{
    /**
     * @var AMQPPoolConfig
     */
    private $amqpConfig;

    /**
     * @var \crosscan\Logger\Facade\LoggerFacade
     */
    private $logger;

    /**
     * @var ExceptionQueueFinder
     */
    private $queueFinder;

    /**
     * @param AMQPPoolConfig       $config
     * @param ExceptionQueueFinder $queueFinder
     * @param Facade\LoggerFacade  $logger
     * @param Serializer           $serializer
     */
    public function __construct(
        AMQPPoolConfig $config,
        ExceptionQueueFinder $queueFinder,
        Facade\LoggerFacade $logger,
        Serializer $serializer = null
    ) {
        $this->amqpConfig  = $config;
        $this->logger      = $logger;
        $this->queueFinder = $queueFinder;
        $this->serializer  = $serializer !== null ? $serializer : new Serializer\PhpSerialize();
    }

    /**
     * @param WorkerPool\Job         $job
     * @param WorkerPool\JobDelivery $jobDelivery
     * @param \Exception             $exception
     */
    public function handle(WorkerPool\Job $job, WorkerPool\JobDelivery $jobDelivery, \Exception $exception)
    {
        $message = 'job of class %s %s';

        $messageArgument1 = get_class($job);

        if ($exception instanceof Exception\TimeOutException && $job->discardOnTimeout === true) {
            $messageArgument2 = "has been discarded as it reached its TTL";
        } else {
            $destinationQueue = $this->queueFinder->findQueue($job, $exception);

            if (isset($job->storeId)) {
                $messageArgument2 = sprintf(
                    'and storeId \'%s\' was delivered to queue %s',
                    $job->storeId,
                    $destinationQueue
                );
            } else {
                $messageArgument2 = sprintf('was delivered to queue %s', $destinationQueue);
            }

            $channel = $this->getChannel();

            $job->numberOfReschedules++;
            $rescheduleMessage = new RescheduleMessage($job, $job->priority, (string) $this->logger->getGroup());

            $newMessage = new Message\AMQPMessage(
                $this->serializer->serializeRescheduleMessage($rescheduleMessage),
                array('delivery_mode' => 2) // make message persistent
            );

            $channel->basic_publish($newMessage, '', $destinationQueue);
        }

        $this->logger->logString(
            sprintf($message, $messageArgument1, $messageArgument2),
            \cscntLogPayload::SEVERITY_DEBUG
        );

        $jobDelivery->ack();
    }

    public function handleUnserializeFailed(
        Exception\UnserializeFailed $e
    ) {
        if ($e instanceof WorkerPool\AMQP\Exception\AmqpMessageUnserializeFailed) {
            $this->handleUnserializableAmqpMessage($e);
        } else {
            throw $e;
        }
    }

    private function handleUnserializableAmqpMessage(WorkerPool\AMQP\Exception\AmqpMessageUnserializeFailed $e)
    {
        // schedule to garbage queue
        $channel = $this->getChannel();
        $channel->basic_publish($e->getAMQPMessage(), '', $this->queueFinder->getGarbageQueueName());

        // ack the message in the worker queue
        $e->getChannel()->basic_ack($e->getAMQPMessage()->get("delivery_tag"));
    }

    /**
     * @return \PhpAmqpLib\Channel\AMQPChannel
     */
    private function getChannel()
    {
        return $this->amqpConfig->openConnection()->channel();
    }
}
