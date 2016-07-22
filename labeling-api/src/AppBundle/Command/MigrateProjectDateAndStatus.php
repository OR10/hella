<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Doctrine\ORM;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;

class MigrateProjectDateAndStatus extends Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @param Facade\Project $projectFacade
     */
    public function __construct(Facade\Project $projectFacade)
    {
        parent::__construct();
        $this->projectFacade = $projectFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:MigrateProjectDateAndStatus');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $projects = $this->projectFacade->findAll();
        $progress = new ProgressBar($output, count($projects));

        /** @var Model\Project $project */
        foreach ($projects as $project) {
            if ($project->getCreationDate() === null) {
                $project->setCreationDate(
                    new \DateTime('now', new \DateTimeZone('UTC'))
                );
            }

            if ($project->getStatus() === null) {
                $project->setStatus(
                    Model\Project::STATUS_IN_PROGRESS
                );
            }
            $this->projectFacade->save($project);
            $progress->advance();
        }
        $progress->finish();
    }
}