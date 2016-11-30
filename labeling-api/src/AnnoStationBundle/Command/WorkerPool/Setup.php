<?php

namespace AnnoStationBundle\Command\WorkerPool;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

/**
 * @deprecated use Hagl\WorkerPoolBundle\Command\Setup instead
 */
class Setup extends Command
{
    public function __construct()
    {
        parent::__construct('annostation:rabbitmq:setup');
    }

    protected function configure()
    {
        $this->addArgument('checkOnly', Input\InputArgument::OPTIONAL, 'Check only the status', false);

        $this->addOption('check-only', null, Input\InputOption::VALUE_NONE, 'Check only the status');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $command = $this->getApplication()->find('hagl:workerpool:setup');

        $newInput = new Input\ArrayInput([], $command->getDefinition());

        if ($input->hasArgument('checkOnly')) {
            $newInput->setOption('check-only', $input->getArgument('checkOnly'));
        }

        return $command->run($newInput, $output);
    }
}
