<?php

namespace AnnoStationBundle\Command\WorkerPool;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

/**
 * @deprecated use Hagl\WorkerPoolBundle\Command\Starter instead
 */
class Starter extends Command
{
    public function __construct()
    {
        parent::__construct('annostation:workerpool:starter');
    }

    protected function configure()
    {
        $this->setDescription('AMQP WorkerPool Start Script');

        $this->addArgument('primary', Input\InputArgument::REQUIRED, '');
        $this->addArgument('secondary', Input\InputArgument::OPTIONAL, '');
        $this->addArgument('cycles', Input\InputArgument::OPTIONAL, '', 500);
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $command = $this->getApplication()->find('hagl:workerpool:starter');

        return $command->run($input, $output);
    }
}

