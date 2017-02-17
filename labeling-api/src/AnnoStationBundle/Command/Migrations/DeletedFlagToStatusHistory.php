<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Symfony\Component\Console;

class DeletedFlagToStatusHistory extends Command\Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * DeletedFlagToStatusHistory constructor.
     *
     * @param Facade\Project $projectFacade
     */
    public function __construct(Facade\Project $projectFacade)
    {
        parent::__construct();
        $this->projectFacade = $projectFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:DeletedFlagToStatusHistory');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $projects = $this->projectFacade->findAllDeleted();

        /** @var Model\Project $project */
        foreach ($projects as $project) {
            if ($project->deleted && $project->getStatus() !== Model\Project::STATUS_DELETED) {
                $project->addStatusHistory(
                    new \DateTime('now', new \DateTimeZone('UTC')),
                    Model\Project::STATUS_DELETED
                );
                $this->writeInfo(
                    $output,
                    sprintf('Updated Project "%s" "%s"', $project->getId(), $project->getName())
                );
            }
            $this->projectFacade->save($project);
        }
    }
}