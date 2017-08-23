<?php
namespace Hagl\WorkerPoolBundle\Command;

use crosscan\WorkerPool\AMQP;
use PhpAmqpLib\Channel;
use PhpAmqpLib\Exception;
use PhpAmqpLib\Message;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class Maintainer extends Command
{
    /**
     * Contains the name of the queue if the current state has a queue
     *
     * @var string
     */
    private $queue;

    /**
     * If the current state implies we are consuming from a queue this field contains the consumer-tag
     *
     * @var string
     */
    private $consumer;

    /**
     * The current amqp-channel in use if any
     *
     * @var Channel\AMQPChannel
     */
    private $channel;

    /**
     * @var array
     */
    private $garbageQueues = ['worker.garbage-collection'];

    /**
     * @var int
     */
    private $messageCountInQueue = 0;

    /**
     * @var int
     */
    private $processedMessageCount = 0;

    /**
     * The message currently being processed if any
     *
     * @var Message\AMQPMessage
     */
    private $message;

    /**
     * @var AMQP\AMQPPoolConfig
     */
    private $config;

    /**
     * The current state. Currently this is an integer from 0-9.
     * See the proceed-method what the meaning of each number is
     *
     * @var int
     */
    private $state;

    /**
     * @var Input\InputInterface
     */
    private $input;

    /**
     * @var Output\OutputInterface
     */
    private $output;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $workerPoolFacade;

    /**
     * @var string
     */
    private $queuePrefix;

    /**
     * Maintainer constructor.
     *
     * @param AMQP\AMQPPoolConfig $config
     * @param AMQP\FacadeAMQP     $workerPoolFacade
     * @param string              $queuePrefix
     */
    public function __construct(AMQP\AMQPPoolConfig $config, AMQP\FacadeAMQP $workerPoolFacade, string $queuePrefix)
    {
        parent::__construct('hagl:workerpool:maintainer');

        $this->config           = $config;
        $this->workerPoolFacade = $workerPoolFacade;
        $this->queuePrefix      = $queuePrefix;
    }

    protected function configure()
    {
        $this->setDescription('WorkerPool maintainer');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $this->input  = $input;
        $this->output = $output;
        $this->state  = 1;
        while ($this->state !== 0) {
            $this->proceed();
        }
    }

    private function proceed()
    {
        switch ($this->state) {
            case 1:
                $this->state = $this->dialogGetQueueName();
                break;
            case 2:
                if ($this->messageCountInQueue > 0 && $this->processedMessageCount === $this->messageCountInQueue) {
                    $this->state = 1;

                    return;
                }
                $this->fetchNextMessage();
                if ($this->message !== null) {
                    $this->processedMessageCount++;
                }
                break;
            case 3:
                $this->state = $this->promptForMessageAction();
                break;
            case 4: // Queue is empty
                $this->output->writeln(
                    '<info>Queue seems to be empty. You may want to choose a different one</info>'
                );
                $this->state = 1;
                break;
            case 5: // inspect payload
                $this->inspectPayload();
                $this->state = 3;
                break;
            case 6: // try to find te logdetails for the given message
                $this->fetchLog();
                $this->state = 3;
                break;
            case 7: // redeliver the message
                $this->redeliverMessage();
                $this->state = 2;
                break;
            case 8: // discard the message
                $this->discardMessage();
                $this->state = 2;
                break;
            case 9: // ignore the message
                $this->ignoreMessage();
                $this->state = 2;
                break;
            case 10: // redeliver all
                $this->redeliverAllMessages();
                $this->state = 1;
        }
    }

    /**
     * @return mixed
     */
    private function dialogGetQueueName()
    {
        $dialog = $this->getHelper('dialog');

        $gc = $dialog->select(
            $this->output,
            'Please select the Queue',
            $this->garbageQueues,
            0
        );
        $this->unregisterConsumer();
        $this->queue = $this->queuePrefix . $this->garbageQueues[$gc];
        $this->registerConsumer();

        return 2;
    }

    /**
     * prints out the current message's body
     */
    private function inspectPayload()
    {
        try {
            $obj = unserialize($this->message->body);

            var_dump($obj);

            if (property_exists($obj, 'queueName')) {
                $this->output->writeln('<info>Queue: ' . $obj->queueName . '</info>');
            }
        } catch (\Exception $e) {
            $this->output->writeln("<error>Couldn't unserialize payload. falling back to old mode</error>");
            var_dump($this->message->body);
        }
    }

    /**
     * tries to retrieve the log belonging to the current message based on the attached cscntRequestId and prints it
     * out. Prints out a depressing message if the current message doesnt have a cscntRequestId attached
     */
    private function fetchLog()
    {
        $this->output->writeln("<error>Fetching logs not implemented yet!</error>");
    }

    private function redeliverAllMessages()
    {
        while ($this->message !== null) {
            $this->redeliverMessage();
            $this->fetchNextMessage();
        }

        $this->state = 1;
    }

    /**
     * Redelivers the current message to the right exchange
     */
    private function redeliverMessage()
    {
        try {
            $deserializedMessage = unserialize($this->message->body);
            $this->deliverCookedMessage($deserializedMessage);
        } catch (\Exception $e) {
            $this->deliverRawMessage();
        }

        $this->channel->basic_ack($this->message->get('delivery_tag'));
        $this->message = null;
    }

    /**
     * Helper-method for redeliverMessage intended to be used if the current message is serialized RescheduleMessage
     *
     * @param $deserializedMessage
     */
    private function deliverCookedMessage($deserializedMessage)
    {

        $deserializedMessage->job->createdAt = new \DateTime('now', new \DateTimeZone('UTC'));
        $this->workerPoolFacade->addJob(
            $deserializedMessage->job,
            $deserializedMessage->job->priority
        );
    }

    /**
     * Helper-method for redeliverMethod used if the current message is not encapsulated into a RescheduleMessage
     */
    private function deliverRawMessage()
    {
        $exchange = $this->config->workerMainExchange;

        $this->channel->basic_publish(
            $this->message,
            $exchange,
            $this->message->get('routing_key')
        );
    }

    /**
     * discards the current message
     */
    private function discardMessage()
    {
        $this->channel->basic_ack($this->message->get('delivery_tag'));
        $this->message = null;
    }

    /**
     * just ignores the current message and tries to fetch the next message. the current message will not be
     * discarded but just postponed
     */
    private function ignoreMessage()
    {
        $this->message = null;
    }

    /**
     * prompts the user to make a choice what to do with the current message and returns the state indicating this
     * choice.
     *
     * @return array|int|mixed|string
     */
    private function promptForMessageAction()
    {
        $options = [
            'Inspect Payload',
            'Inspect Log',
            'Redeliver message',
            'Discard Message',
            'Ignore Message',
            'Redeliver ALL the things o/',
        ];

        $dialog = $this->getHelper('dialog');
        $action = $dialog->select($this->output, 'Now we have a message you have following options:', $options, 0);

        return $action + 5;
    }

    /**
     * tries to comsume the next message from the current queue.
     *
     * @return int|void if there is no next message it returns 4. Due to the architecure of phpamqplib it
     * returns nothing if a message is cosumed
     */
    private function fetchNextMessage()
    {
        try {
            return $this->channel->wait(['60,60'], true, 1); // only wait for basic.deliver
        } catch (Exception\AMQPTimeoutException $e) {
            $this->state = 4;
        }
    }

    /**
     * Called by phpamqplib as soon as there is a next mssage to consume
     *
     * @param Message\AmqpMessage $message
     */
    private function consumeMessage(Message\AmqpMessage $message)
    {
        $this->message = $message;
        $this->state   = 5;
    }

    /**
     * Unregisters the current consumer
     */
    private function unregisterConsumer()
    {
        if ($this->consumer !== null) {
            $this->channel->basic_cancel($this->consumer);
            $this->consumer = null;
            $this->channel->close();
            $this->channel = null;
        }
    }

    /**
     * registers a new consumer
     */
    private function registerConsumer()
    {

        $this->channel = $this->config
            ->openConnection()
            ->channel();

        //declare queue passively to retrieve the messagecount
        $queueMetadata             = $this->channel->queue_declare(
            $this->queue,
            true
        );
        $this->messageCountInQueue = (int) $queueMetadata[1];

        $this->consumer = $this->channel->basic_consume(
            $this->queue,
            "",
            false,
            false,
            false,
            false,
            function ($message) {
                $this->consumeMessage($message);
            }
        );
    }
}
