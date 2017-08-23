<?php

namespace Hagl\WorkerPoolBundle\Command;

use crosscan\WorkerPool\JobRescheduler;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Rescheduler extends Command
{
    /**
     * @var JobRescheduler
     */
    private $jobRescheduler;

    /**
     * Create a new console command to reschedule jobs in the worker pool.
     *
     * @param JobRescheduler $jobRescheduler
     */
    public function __construct(JobRescheduler $jobRescheduler)
    {
        parent::__construct('hagl:workerpool:rescheduler');

        $this->jobRescheduler = $jobRescheduler;
    }

    /**
     * Configure the command (set the command name, define arguments, ...).
     */
    protected function configure()
    {
        $this->setDescription(
            'Command for redelivering jobs from a given rescheudle queue to the jobs\' original queue'
        );

        $this->addArgument('queue', InputArgument::REQUIRED, 'The queue to reschedule from');
    }

    /**
     * Execute the command.
     *
     * @param InputInterface  $input  The input used to access the arguments.
     * @param OutputInterface $output The output used to write any message.
     *
     * @return int
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->jobRescheduler->run($input->getArgument('queue'));

        return 0;
    }
}
