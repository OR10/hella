<?php

namespace crosscan\WorkerPool\AMQP;

use PhpAmqpLib\Channel;
use PhpAmqpLib\Message;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Serializer;

class JobSourceAMQP extends WorkerPool\JobSource
{
    /**
     * @var string
     */
    private $primaryQueue;

    /**
     * @var string
     */
    private $secondaryQueue;

    /**
     * @var Channel\AMQPChannel
     */
    private $channel;

    /**
     * @var WorkerPool\Serializer
     */
    private $serializer;

    private $running = true;
    private $primaryJobs = array();
    private $secondaryJobs = array();

    /**
     * @param string $primaryQueue name of the primary queue to consume from
     * @param string $secondaryQueue name of the secondaty queue to consume from
     * @param Channel\AMQPChannel $channel channel though which to consume
     */
    public function __construct($primaryQueue, $secondaryQueue, Channel\AMQPChannel $channel, Serializer $serializer = null)
    {
        $this->primaryQueue   = $primaryQueue;
        $this->secondaryQueue = $secondaryQueue;
        $this->channel        = $channel;
        $this->serializer     = $serializer !== null ? $serializer : new Serializer\PhpSerialize();

        /*
         * we use baicaly the same consumer tag to consume from both queues, prefixed with the queues' names
         * to identify both consumers belonging to the same worker. Yet we want to support that primary and secondary
         * point to the same queue hence we have to check if both queues are the same.
         */
        $this->consumerTag = md5(uniqid());

        $thisHelper = $this;
        $channel->basic_consume(
            $primaryQueue,
            $primaryQueue . '-' . $this->consumerTag,
            false,
            false,
            false,
            false,
            function (Message\AMQPMessage $message) use ($thisHelper) {
                $thisHelper->consume($message, $thisHelper->primaryQueue, $thisHelper->primaryJobs);
            }
        );

        if ($primaryQueue !== $secondaryQueue) {
            $channel->basic_consume(
                $secondaryQueue,
                $secondaryQueue . '-' . $this->consumerTag,
                false,
                false,
                false,
                false,
                function (Message\AMQPMessage $message) use ($thisHelper) {
                    $thisHelper->consume($message, $thisHelper->secondaryQueue, $this->secondaryJobs);
                }
            );
        }
    }

    /**
     * Blocks until the next Job arrives or the timeout is reached. If possible it returns the next Job, null otherwise
     * The implementation of getNext is responsible for dispatching signals via pcntl_signal_dispatch.
     *
     * @param int $timeout Timeout in seconds i.e. how long to wait for the next job at max.
     *                     Defaults to 0 meaning no timeout
     *
     * @return WorkerPool\JobDelivery|null
     */
    public function getNext($timeout = 0)
    {
        while ($this->running) {

            pcntl_signal_dispatch();

            $message = $this->getMessage($this->primaryJobs);

            if ($message !== false) {
                return $message;
            }

            $message = $this->getMessage($this->secondaryJobs);

            if ($message !== false) {
                return $message;
            }

            try {
                // wait at least 1 second, or longer if a timeout is set
                $this->channel->wait(null, true, $timeout === 0 ? 1 : $timeout);
            } catch (\PhpAmqpLib\Exception\AMQPTimeoutException $ignored) {
                if ($timeout !== 0) {
                    // Return if a timeout is set and we ran into a timeout
                    $this->running = false;
                    return null;
                }
            }
        }

        return null;
    }

    /**
     * Gracefully shut down the worker. Might take some time to take effect as it might be blocked in a call until
     * the timeout kicks in or because its currently working on a long running Job
     */
    public function stop()
    {
        $this->channel->basic_cancel($this->primaryQueue . '-' . $this->consumerTag);

        if ($this->primaryQueue !== $this->secondaryJobs) {
            $this->channel->basic_cancel($this->secondaryQueue . '-' . $this->consumerTag);
        }

        $this->running = false;
    }

    /**
     * Returns the oldest message from $messages or false if there arn't any messages at all
     *
     * @return bool|JobDeliveryAMQP
     */
    private function getMessage(array &$messages)
    {
        if (count($messages)) {
            $index   = array_keys($messages)[0];
            $message = $messages[$index];
            unset($messages[$index]);

            return $message;
        } else {
            return false;
        }
    }

    /**
     * Called by a closure passed to the AMQP lib which will call the closure when this worker is supposed to consume
     * an incoming message
     *
     * @param Message\AMQPMessage $message the message to consume
     * @param string $queue the name of the queue from which the message was vonsumed
     * @param array $jobArray a reference to the message array where the messages will be buffered.
     *                        either $this->primaryJobs ot $this->secondaryJobs
     */
    private function consume(Message\AMQPMessage $message, $queue, array &$jobArray)
    {
        $jobArray[] = new JobDeliveryAMQP($message, $queue, $this->channel, $this->serializer);
    }
}
