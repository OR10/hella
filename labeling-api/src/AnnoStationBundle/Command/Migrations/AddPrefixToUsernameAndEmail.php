<?php

namespace AnnoStationBundle\Command\Migrations;

use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Doctrine\ORM;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;
use AnnoStationBundle\Command;

class AddPrefixToUsernameAndEmail extends Command\Base
{
    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * @param Facade\User $userFacade
     */
    public function __construct(
        Facade\User $userFacade
    ) {
        parent::__construct();
        $this->userFacade = $userFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:AddPrefixToUsernameAndEmail')
            ->setDescription('Add a prefix to all users and email addresses')
            ->addArgument('prefix', Input\InputArgument::REQUIRED, 'Prefix to add');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $prefix = $input->getArgument('prefix');

        $users = $this->userFacade->getUserList();

        foreach ($users as $user) {
            $user->setUsername(sprintf('%s_%s', $prefix, $user->getUsername()));
            $user->setUsernameCanonical(sprintf('%s_%s', $prefix, $user->getUsernameCanonical()));
            $user->setEmail(sprintf('%s_%s', $prefix, $user->getEmail()));
            $user->setEmailCanonical(sprintf('%s_%s', $prefix, $user->getEmailCanonical()));
        }

        $this->userFacade->updateUser($user);
    }
}
