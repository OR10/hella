<?php

namespace AppBundle\Command;

use AppBundle\Model;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\OutputInterface;

class CreateDummyDataCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this->setName('annostation:create:dummydata')
            ->setDescription('Create initial dummy data for all present models')
            ->addOption(
                'no-known-login',
                null,
                InputOption::VALUE_NONE,
                "Don't create an additional user with the following credentials: username=user, email=foo@bar.baz, password=password"
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('Starting...');
        $this->callCommand('annostation:create:user', 5, ['--known-login' => !$input->getOption('no-known-login')], $output);
        $this->callCommand('annostation:create:video', 5, [], $output);
        $this->callCommand('annostation:create:prelabeledframe', 5, [], $output);
        $this->callCommand('annostation:create:labelingtask', 5, [], $output);
        $this->callCommand('annostation:create:labeledframe', 5, [], $output);
        $this->callCommand('annostation:create:labeledthing', 5, [], $output);
        $this->callCommand('annostation:create:labeledthinginframe', 5, [], $output);

        $output->writeln('Finished!');
    }

    private function callCommand($commandName, $count, $optionalParameters = [], OutputInterface $output)
    {
        $command = $this->getApplication()->find($commandName);

        $userInput = new ArrayInput(
            array_merge(
                [
                    'count' => $count,
                ],
                $optionalParameters
            )
        );

        $output->writeln('Calling: ' . $commandName);
        $command->run($userInput, new NullOutput());
    }

}
