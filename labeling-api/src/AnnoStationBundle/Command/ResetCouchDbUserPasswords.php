<?php

namespace AnnoStationBundle\Command;

use AnnoStationBundle\Command;
use AppBundle\Database\Facade;
use Symfony\Component\Console;
use Symfony\Component\Console\Question\ConfirmationQuestion;


class ResetCouchDbUserPasswords extends Command\Base
{
    /**
     * @var Facade\CouchDbUsers
     */
    private $couchDbUsersFacade;

    /**
     * @var Facade\User
     */
    private $userFacade;

    public function __construct(
        Facade\CouchDbUsers $couchDbUsersFacade,
        Facade\User $userFacade
    ) {
        parent::__construct();
        $this->couchDbUsersFacade = $couchDbUsersFacade;
        $this->userFacade         = $userFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:ResetCouchDbUserPasswords');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $helper = $this->getHelper('question');
        $question = new ConfirmationQuestion(
            'This command will reset ALL CouchDB passwords for every FOS User! Are you sure?',
                false
        );

        if (!$helper->ask($input, $output, $question)) {
            return;
        }

        $users = $this->userFacade->getUserList();

        foreach ($users as $user) {
            $couchDbPassword = substr($this->tokenGenerator->generateToken(), 0, 20);

            $this->couchDbUsersFacade->updateUser($user->getUsername(), $couchDbPassword);

            $user->setCouchDbPassword($couchDbPassword);
            $this->userFacade->saveUser($user);

            $this->writeInfo(
                $output,
                sprintf('Updated User "%s"', $user->getUsername())
            );
        }
    }
}