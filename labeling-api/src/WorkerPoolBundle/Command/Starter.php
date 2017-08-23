<?php
namespace Hagl\WorkerPoolBundle\Command;

use crosscan\Logger\Facade;
use crosscan\NewRelic;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Hagl\WorkerPoolBundle\ExceptionEstimator;

class Starter extends Command
{
    /**
     * @var AMQP\AMQPPoolConfig
     */
    private $config;

    /**
     * @var Facade\LoggerFacade
     */
    private $loggerFacade;

    /**
     * @var WorkerPool\JobInstructionFactory
     */
    private $jobInstructionFactory;

    /**
     * @var WorkerPool\EventHandler
     */
    private $eventHandler;

    /**
     * @var string
     */
    private $queuePrefix;

    /**
     * WorkerStarter constructor.
     *
     * @param AMQP\AMQPPoolConfig              $config
     * @param \cscntLogger                     $logger
     * @param WorkerPool\JobInstructionFactory $jobInstructionFactory
     * @param WorkerPool\EventHandler          $eventHandler
     * @param string                           $queuePrefix
     */
    public function __construct(
        AMQP\AMQPPoolConfig $config,
        \cscntLogger $logger,
        WorkerPool\JobInstructionFactory $jobInstructionFactory,
        WorkerPool\EventHandler $eventHandler,
        string $queuePrefix
    ) {
        parent::__construct('hagl:workerpool:starter');

        $this->config                = $config;
        $this->loggerFacade          = new Facade\LoggerFacade($logger, \cscntLogFacility::WORKER_POOL);
        $this->jobInstructionFactory = $jobInstructionFactory;
        $this->eventHandler          = $eventHandler;
        $this->queuePrefix           = $queuePrefix;
    }

    protected function configure()
    {
        $this->setDescription('Starts a worker for the given queues');

        $this->addArgument('primary', Input\InputArgument::REQUIRED, 'Primary queue to listen for jobs');
        $this->addArgument('secondary', Input\InputArgument::OPTIONAL, 'Secondary queue to listen for jobs');
        $this->addArgument('cycles', Input\InputArgument::OPTIONAL, 'Exit after this number of jobs', 500);
    }

    /**
     * @param Input\InputInterface   $input
     * @param Output\OutputInterface $output
     *
     * @return int
     */
    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $primary        = $input->getArgument('primary');
        $secondary      = $input->getArgument('secondary') ?: $primary;
        $cycles         = $input->getArgument('cycles');
        $primaryQueue   = $this->getQueue($primary);
        $secondaryQueue = $this->getQueue($secondary);
        $connection     = $this->config->openConnection();
        $channel        = $connection->channel();

        if ($primaryQueue === null) {
            $output->writeln(sprintf('<error>Unknown queue: %s</error>', $primary));

            return 1;
        }

        if ($secondaryQueue === null) {
            $output->writeln(sprintf('<error>Unknown queue: %s</error>', $secondary));

            return 1;
        }

        $channel->basic_qos(0, 1, 0);

        $exceptionEstimator = new ExceptionEstimator(7);
        $queueFinder        = new AMQP\ExceptionQueueFinder($exceptionEstimator);
        $jobSource          = new AMQP\JobSourceAMQP($primaryQueue, $secondaryQueue, $channel);
        $rescheduleManager  = new AMQP\AMQPRescheduleManager($this->config, $queueFinder, $this->loggerFacade);
        $newRelicWrapper    = [];

        $tidewaysApiKey = ini_get('tideways.api_key');
        if ($tidewaysApiKey !== false && $tidewaysApiKey !== '') {
            $newRelicWrapper[] = new NewRelic\QafooProfiler($tidewaysApiKey, gethostname());
        }

        $worker = new WorkerPool\Worker(
            $jobSource,
            $this->jobInstructionFactory,
            $this->loggerFacade,
            $rescheduleManager,
            new NewRelic\Aggregated($newRelicWrapper),
            $this->eventHandler
        );

        try {
            $worker->work($cycles);
            $jobSource->stop();
            $channel->close();
            $connection->close();
        } catch (\Exception $e) {
            $this->loggerFacade->logException($e, \cscntLogPayload::SEVERITY_ERROR);

            return 1;
        }

        return 0;
    }

    /**
     * @param $marker
     *
     * @return string
     */
    private function getQueue($marker)
    {
        if (preg_match('(^high$)i', $marker)) {
            return $this->queuePrefix . 'worker.queue.high_prio';
        }

        if (preg_match('(^normal$)i', $marker)) {
            return $this->queuePrefix . 'worker.queue.normal_prio';
        }

        if (preg_match('(^low$)i', $marker)) {
            return $this->queuePrefix . 'worker.queue.low_prio';
        }

        return null;
    }
}
