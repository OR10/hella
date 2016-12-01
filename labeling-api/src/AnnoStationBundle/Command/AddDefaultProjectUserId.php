<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;
use Doctrine\ODM\CouchDB;

class AddDefaultProjectUserId extends Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * @param Facade\Project $projectFacade
     * @param Facade\User    $userFacade
     */
    public function __construct(Facade\Project $projectFacade, Facade\User $userFacade)
    {
        parent::__construct();
        $this->projectFacade = $projectFacade;
        $this->userFacade    = $userFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:AddDefaultProjectUserId')
            ->addArgument('userId', Input\InputArgument::REQUIRED, 'UserID to set.');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $userId = $input->getArgument('userId');
        $user   = $this->userFacade->getUserById($userId);
        if ($user === null) {
            throw new \Exception('There is no user with the id ' . $userId);
        }
        $projects = $this->projectFacade->findAll();
        $progress = new ProgressBar($output, count($projects));

        /** @var Model\Project $project */
        foreach ($projects as $project) {
            if ($project->getUserId() === null) {
                $project->setUserId(
                    $userId
                );
                $this->projectFacade->save($project);
            }

            $progress->advance();
        }
        $progress->finish();
    }
}
