<?php

namespace AppBundle\Command;

use AppBundle\Model;
use Faker;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateUserCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this->setName('annostation:create:user')
            ->setDescription('Create random dummy user in the database')
            ->addArgument('count', InputArgument::OPTIONAL, "How many users do you want to create?")
            ->addOption(
                'known-login',
                null,
                InputOption::VALUE_NONE,
                "Create a additional user with the following credentials: username=user, email=foo@bar.baz, password=password"
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $faker       = Faker\Factory::create();
        $manipulator = $this->getContainer()->get('fos_user.util.user_manipulator');
        $knownLogin  = $input->getOption('known-login');

        $count = $input->getArgument('count') ? $input->getArgument('count') : 1;

        if ($knownLogin) {
            $manipulator->create('user', 'password', 'foo@bar.baz', true, false);
            $count--;
        }

        for ($i = 0; $i < $count; $i++) {
            $manipulator->create($faker->userName, $faker->password(), $faker->email, true, false);
        }
    }
}
