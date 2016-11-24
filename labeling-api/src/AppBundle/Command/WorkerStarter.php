<?php
namespace AppBundle\Command;

use AppBundle\Service;
use AppBundle\Worker\EventHandler;
use AppBundle\Worker\JobInstructionFactory;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use crosscan\Logger\Facade;
use crosscan\NewRelic;

class WorkerStarter extends Base
{
    /**
     * @var AMQP\AMQPPoolConfig
     */
    private $AMQPPoolConfig;

    /**
     * @var Facade\LoggerFacade
     */
    private $loggerFacade;

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @var string
     */
    private $queuePrefix;

    /**
     * WorkerStarter constructor.
     *
     * @param Service\AMQPPoolConfig  $AMQPPoolConfig
     * @param \cscntLogger            $logger
     * @param CouchDB\DocumentManager $documentManager
     * @param string                  $queuePrefix
     */
    public function __construct(
        Service\AMQPPoolConfig $AMQPPoolConfig,
        \cscntLogger $logger,
        CouchDB\DocumentManager $documentManager,
        string $queuePrefix
    ) {
        parent::__construct();

        $this->AMQPPoolConfig  = $AMQPPoolConfig;
        $this->loggerFacade    = new Facade\LoggerFacade($logger, \cscntLogFacility::WORKER_POOL);
        $this->documentManager = $documentManager;
        $this->queuePrefix     = $queuePrefix;
    }

    protected function configure()
    {
        $this->setName('annostation:workerpool:starter')
            ->setDescription('AMQP WorkerPool Start Script')
            ->addArgument('primary', Input\InputArgument::REQUIRED, '')
            ->addArgument('secondary', Input\InputArgument::OPTIONAL, '')
            ->addArgument('cycles', Input\InputArgument::OPTIONAL, '', 500);
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
        $secondary      = empty($input->getArgument('secondary')) ? $primary : $input->getArgument('secondary');
        $cycles         = $input->getArgument('cycles');
        $primaryQueue   = $this->getQueue($primary);
        $secondaryQueue = $this->getQueue($secondary);
        $connection     = $this->AMQPPoolConfig->openConnection();
        $channel        = $connection->channel();

        if ($primaryQueue === null) {
            $output->writeln("<error>Unknown queue: {$primary}</error>");

            return 1;
        }

        if ($secondaryQueue === null) {
            $output->writeln("<error>Unknown queue: {$secondary}</error>");

            return 1;
        }

        $channel->basic_qos(0, 1, 0);

        $exceptionEstimator   = new AMQP\ExceptionEstimator();
        $queueFinder          = new AMQP\ExceptionQueueFinder($exceptionEstimator);
        $jobSource            = new AMQP\JobSourceAMQP($primaryQueue, $secondaryQueue, $channel);
        $rescheduleManager    = new AMQP\AMQPRescheduleManager(
            $this->AMQPPoolConfig,
            $queueFinder,
            $this->loggerFacade
        );
        $instructionInstances = $this->AMQPPoolConfig->instructionInstances;
        $container            = $this->getContainer();
        $serviceInstances     = new JobInstructionFactory\ServicesInstances($instructionInstances, $container);
        $newRelicWrapper      = array();

        $tidewaysApiKey = ini_get('tideways.api_key');
        if ($tidewaysApiKey !== false && $tidewaysApiKey !== '') {
            $newRelicWrapper[] = new NewRelic\QafooProfiler($tidewaysApiKey, gethostname());
        }

        $worker = new WorkerPool\Worker(
            $jobSource,
            $serviceInstances,
            $this->loggerFacade,
            $rescheduleManager,
            new NewRelic\Aggregated($newRelicWrapper),
            new EventHandler\DoctrineIdentityMapReset($this->documentManager)
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
