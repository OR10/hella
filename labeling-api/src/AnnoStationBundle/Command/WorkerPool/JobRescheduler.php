<?php

namespace AnnoStationBundle\Command\WorkerPool;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use crosscan\WorkerPool;

class JobRescheduler extends Command
{
    /**
     * @var WorkerPool\JobRescheduler
     */
    private $jobRescheduler;

    public function __construct(WorkerPool\JobRescheduler $jobRescheduler)
    {
        parent::__construct();
        $this->jobRescheduler = $jobRescheduler;
    }

    protected function configure()
    {
        $this->setName('annostation:worker-pool:job-rescheduler')
        ->setDescription('RabbitMQ JobRescheduler Script')
            ->addArgument('queue', Input\InputArgument::REQUIRED, 'Queue name for job redelivery.');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $this->jobRescheduler->run($input->getArgument('queue'));
    }
}
