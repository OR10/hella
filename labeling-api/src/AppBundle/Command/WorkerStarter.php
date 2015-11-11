<?php
namespace AppBundle\Command;

use AppBundle\Service;
use AppBundle\Worker\JobInstructionFactory;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use crosscan\Logger\Facade;
use crosscan\NewRelic;

class WorkerStarter extends BaseCommand
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
        $this->setName('annostation:workerpool:starter')
            ->setDescription('AMQP WorkerPool Start Script')
            ->addArgument('primary', Input\InputArgument::REQUIRED, '')
            ->addArgument('secondary', Input\InputArgument::OPTIONAL, '')
            ->addArgument('cycles', Input\InputArgument::OPTIONAL, '', 500);
    }

    /**
     * @param Input\InputInterface   $input
     * @param Output\OutputInterface $output
     */
    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $primary        = $input->getArgument('primary');
        $secondary      = empty($input->getArgument('secondary')) ? $primary : $input->getArgument('secondary');
        $cycles         = $input->getArgument('cycles');
        $primaryQueue   = $this->getQueue(
            $primary
        );
        $secondaryQueue = $this->getQueue(
            $secondary
        );
        $connection     = $this->AMQPPoolConfig->openConnection();
        $channel        = $connection->channel();

        $channel->basic_qos(
            0,
            1,
            0
        );

        $exceptionEstimator = new AMQP\ExceptionEstimator();
        $queueFinder        = new AMQP\ExceptionQueueFinder($exceptionEstimator);

        $loggerFacade = new Facade\LoggerFacade(
            new \cscntLogger(),
            \cscntLogFacility::WORKER_POOL
        );

        $jobSource         = new AMQP\JobSourceAMQP($primaryQueue, $secondaryQueue, $channel);
        $rescheduleManager = new AMQP\AMQPRescheduleManager($this->AMQPPoolConfig, $queueFinder, $loggerFacade);

        $container = $this->getContainer();

        $worker = new WorkerPool\Worker(
            $jobSource,
            new JobInstructionFactory\ServicesInstances($this->AMQPPoolConfig->instructionInstances, $container),
            $loggerFacade,
            $rescheduleManager,
            new NewRelic\Aggregated(array())
        );

        try {
            $worker->work($cycles);
            $jobSource->stop();
            $channel->close();
            $connection->close();
        } catch (\Exception $e) {
            $loggerFacade->logString(
                'Error during worker execution: ' . $e->getMessage(),
                \cscntLogPayload::SEVERITY_ERROR
            );

            exit(1);
        }
    }

    /**
     * @param $marker
     * @return string
     */
    private function getQueue($marker)
    {
        switch (true) {
            case preg_match(
                '(^high$)i',
                $marker
            ):
                return 'worker.queue.high_prio';
            case preg_match(
                '(^normal$)i',
                $marker
            ):
                return 'worker.queue.normal_prio';
            case preg_match(
                '(^low$)i',
                $marker
            ):
                return 'worker.queue.low_prio';
            default:
                exit(0);
        }
    }

}