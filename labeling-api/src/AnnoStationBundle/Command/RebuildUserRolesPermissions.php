<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade as AppBundleFacade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;
use AnnoStationBundle\Worker\Jobs;

class RebuildUserRolesPermissions extends Base
{
    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var AppBundleFacade\User
     */
    private $userFacade;

    public function __construct(
        AppBundleFacade\User $userFacade,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        parent::__construct();
        $this->amqpFacade = $amqpFacade;
        $this->userFacade       = $userFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:rebuild-user-roles-permissions')
            ->setDescription('Rebuild all user roles permissions')
            ->addArgument(
                'userId',
                Input\InputArgument::OPTIONAL,
                'Rebuild the roles only for this userId.'
            );
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $userId = $input->getArgument('userId');
        if ($userId === null) {
            $users = $this->userFacade->getUserList();
        } else {
            $users = [$this->userFacade->getUserById($userId)];
        }
        $numberOfUsers = count($users);
        $progress = new ProgressBar($output, $numberOfUsers);
        $output->writeln('<info>Adding ' . $numberOfUsers . ' RabbitMQ jobs to rebuild user roles permissions</info>');

        /** @var Model\User $user */
        foreach ($users as $user) {
            $this->amqpFacade->addJob(new Jobs\UserRolePermissionRebuilder($user->getId()), WorkerPool\Facade::HIGH_PRIO);
            $progress->advance();
        }
        $progress->finish();
    }
}
