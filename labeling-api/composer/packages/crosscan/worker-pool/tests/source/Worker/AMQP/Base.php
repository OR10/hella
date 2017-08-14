<?php

namespace crosscan\WorkerPool\AMQP;

use crosscan\RabbitMQ;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use PhpAmqpLib\Channel;

abstract class Base extends \PHPUnit_Framework_TestCase
{
    /**
     * @var RabbitMQ\SetupHelper
     */
    protected $rabbitMqSetupHelper;

    /**
     * @var AMQP\AMQPPoolConfig
     */
    protected $config;

    /**
     * @var Channel\AMQPChannel
     */
    protected $amqpChannel;
    protected $configFile;
    protected $loggerMock;
    protected $testGroupUuid = 'foo-bar-baz';

    private $exchanges = array();
    private $queues = array();


    /**
     * Adds a new queue to the virtual host which will be bound to the exchange with the name $exchangeName using the
     * routing key $routingKey.
     * Can be called several times o bind the queue to more then one exchange.
     * A RuntimeException will be thrown if the exchange doesn't exist.
     *
     * @param string $queueName
     * @param string $exchangeName
     * @param string $routingKey
     * @throws \RuntimeException
     */
    protected function addQueue($queueName, $exchangeName = '', $routingKey = '')
    {
        if ($exchangeName !== '' && !isset($this->exchanges[$exchangeName])) {
            throw new \RuntimeException("The exchange '" . $exchangeName . "' does not exist");
        }

        if (!isset($this->queues[$queueName])) {
            $this->queues[$queueName] = array();
        }

        if ($exchangeName !== '') {
            $this->queues[$queueName][] = array($exchangeName, $routingKey);
        }
    }

    /**
     * Adds a new exchange pf type $type to the virtual host which will can optionally be bound to another exchange
     * with the name $exchangeName using the routing key $routingKey.
     * Can be called several times o bind the queue to more then one exchange.
     * A RuntimeException will be thrown if the other exchange doesn't exist.
     *
     * @param string $exchangeName
     * @param string $type
     * @param null   $otherExchangeName
     * @param string $routingKey
     * @throws \RuntimeException
     */
    protected function addExchange($exchangeName, $type, $otherExchangeName = null, $routingKey = '')
    {
        if (!isset($this->exchanges[$exchangeName])) {
            $this->exchanges[$exchangeName]             = array();
            $this->exchanges[$exchangeName]['type']     = $type;
            $this->exchanges[$exchangeName]['bindings'] = array();
        }

        if ($otherExchangeName !== null) {
            if (isset($this->exchanges[$otherExchangeName])) {
                $this->exchanges[$exchangeName]['bindings'][] = array($otherExchangeName, $routingKey);
            } else {
                throw new \RuntimeException("The other exchange '" . $otherExchangeName . "' does not exist");
            }
        }
    }

    /**
     * If the test needs more then the predefined queues they can be configured in this method
     */
    protected function setupQueues()
    {
    }


    public function setUp()
    {
        $this->configFile = __DIR__ . '/poolTestConfig.php';
        $this->config = include $this->configFile;

        $this->rabbitMqSetupHelper = new RabbitMQ\SetupHelper(
            $this->config->username,
            $this->config->password,
            $this->config->host,
            $this->config->port,
            $this->config->webApiPort,
            $this->config->vhost
        );

        $this->config->vhost = $this->rabbitMqSetupHelper->getVirtualHost();

        $this->addExchange('worker.main.exchange', 'topic');
        $this->addExchange('worker.garbage-collection', 'fanout');

        $this->addQueue('worker.reschedule.30s');
        $this->addQueue('worker.reschedule.60s');
        $this->addQueue('worker.reschedule.300s');
        $this->addQueue('worker.reschedule.900s');
        $this->addQueue('worker.garbage-collection', 'worker.garbage-collection');
        $this->addQueue('worker.queue.normal_prio', 'worker.main.exchange', 'worker.queue.normal_prio.#');
        $this->addQueue('worker.queue.low_prio', 'worker.main.exchange', 'worker.queue.low_prio.#');
        $this->addQueue('worker.queue.high_prio', 'worker.main.exchange', 'worker.queue.high_prio.#');

        $this->setupQueues();

        $exchanges = array();

        foreach ($this->exchanges as $exchangeName => $exchangeDefinition) {
            $exchange                 = new RabbitMQ\Exchange($exchangeName, $exchangeDefinition['type']);
            $exchanges[$exchangeName] = $exchange;
            $this->rabbitMqSetupHelper->addExchange($exchange);
        }

        foreach ($this->exchanges as $exchangeName => $exchangeDefinition) {
            foreach ($exchangeDefinition['bindings'] as $exchangeBinding) {
                list($otherExchangeName, $routingKey) = $exchangeBinding;
                $exchanges[$exchangeName]->addBinding($exchanges[$otherExchangeName], $routingKey);
            }
        }

        foreach ($this->queues as $queueName => $queueBindings) {
            $queue = new RabbitMQ\Queue($queueName);

            $this->rabbitMqSetupHelper->addQueue($queue);

            foreach ($queueBindings as $binding) {
                list($exchangeName, $routingKey) = $binding;
                $queue->addBinding($exchanges[$exchangeName], $routingKey);
            }
        }

        $this->rabbitMqSetupHelper->setup();

        $this->loggerMock = \Phake::mock('\cscntLogger');
        \Phake::when($this->loggerMock)
            ->getGroup()
            ->thenReturn($this->testGroupUuid);

        $connection = $this->config->openConnection();
        $this->amqpChannel = $connection->channel();
    }

    public function tearDown()
    {
        if ($this->rabbitMqSetupHelper !== null) {
            $this->rabbitMqSetupHelper->tearDown();
        }
        
        if ($this->amqpChannel !== null) {
            $this->amqpChannel->close();
        }
    }

    protected function runWorkerPool($primaryQueue, $secondaryQueue, $cycles, $eventHandler = null)
    {
        $exceptionEstimator = new \crosscan\WorkerPool\AMQP\ExceptionEstimator();
        $queueFinder        = new \crosscan\WorkerPool\AMQP\ExceptionQueueFinder($exceptionEstimator);
        $loggerFacade       = \Phake::mock('crosscan\Logger\Facade\LoggerFacade');
        $newRelicWrapper    = \Phake::mock('crosscan\NewRelic\Wrapper');
        $jobSource          = new \crosscan\WorkerPool\AMQP\JobSourceAMQP(
            $primaryQueue,
            $secondaryQueue,
            $this->amqpChannel
        );
        $rescheduleManager  = new \crosscan\WorkerPool\AMQP\AMQPRescheduleManager(
            $this->config,
            $queueFinder,
            $loggerFacade
        );

        // if an exception is thrown during execution the worker stops itself even if it didnt run $cycles that time
        // hence we have to make sure it makes all the cycles that we need for the test
        for ($i = 0; $i < $cycles; $i++) {
            $worker = new \crosscan\WorkerPool\Worker(
                $jobSource,
                new WorkerPool\JobInstructionFactory\MappingWithCreateInstance($this->config->instructionInstances),
                $loggerFacade,
                $rescheduleManager,
                $newRelicWrapper,
                $eventHandler
            );

            $worker->work(1);
        }
    }
}
