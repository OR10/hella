<?php

namespace AppBundle\Command;

use AppBundle\Model;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\OutputInterface;

class CreateDummyDataCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this->setName('annostation:create:dummydata')
            ->setDescription('Create initial dummy data for all present models');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->createUsers(5);
        $this->createVideo(5);

        $output->writeln('Done!');
    }

    protected function createUsers($count)
    {
        $command = $this->getApplication()->find('annostation:create:user');

        $userInput = new ArrayInput(
            array(
                'count'         => $count,
                '--known-login' => true,
            )
        );

        $command->run($userInput, new NullOutput());
    }
    protected function createVideo($count)
    {
        $command = $this->getApplication()->find('annostation:create:video');

        $videoInput = new ArrayInput(
            array(
                'count'         => $count,
            )
        );

        $command->run($videoInput, new NullOutput());
    }

}