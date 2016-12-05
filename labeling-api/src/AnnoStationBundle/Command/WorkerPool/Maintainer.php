<?php

namespace AnnoStationBundle\Command\WorkerPool;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

/**
 * @deprecated use Hagl\WorkerPoolBundle\Command\Maintainer instead
 */
class Maintainer extends Command
{
    public function __construct()
    {
        parent::__construct('annostation:workerpool:maintainer');
    }

    protected function configure()
    {
        $this->setDescription('RabbitMQ Maintainer Script');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $command = $this->getApplication()->find('hagl:workerpool:maintainer');

        return $command->run($input, $output);
    }
}

