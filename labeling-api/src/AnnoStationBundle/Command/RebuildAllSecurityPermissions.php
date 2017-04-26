<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;
use crosscan\WorkerPool\AMQP;
use AnnoStationBundle\Worker\Jobs;

class RebuildAllSecurityPermissions extends Base
{
    protected function configure()
    {
        $this->setName('annostation:rebuild-all-security-permissions')
            ->setDescription('Rebuild all security relevant documents for all tasks/users');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $commandNames = [
            'annostation:rebuild-task-database-security-permissions',
            'annostation:rebuild-task-database-validate-doc-update-documents',
            'annostation:rebuild-user-roles-permissions',
        ];

        foreach ($commandNames as $commandName) {
            $output->writeln('<info>Running: ' . $commandName . '</info>');

            $command = $this->getApplication()->find($commandName);
            $command->run($input, $output);
            $output->writeln('');
        }
    }
}
