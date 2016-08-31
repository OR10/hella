<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;
use Doctrine\ODM\CouchDB;

class AssignDefaultLabelingGroup extends Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroup;

    /**
     * @param Facade\Project       $projectFacade
     * @param Facade\LabelingGroup $labelingGroup
     */
    public function __construct(Facade\Project $projectFacade, Facade\LabelingGroup $labelingGroup)
    {
        parent::__construct();
        $this->projectFacade = $projectFacade;
        $this->labelingGroup = $labelingGroup;
    }

    protected function configure()
    {
        $this->setName('annostation:AssignDefaultLabelingGroup')
            ->addArgument('labelingGroupId', Input\InputArgument::REQUIRED, 'LabelingGroupID to set.');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $labelingGroupId = $input->getArgument('labelingGroupId');
        $labelingGroup   = $this->labelingGroup->find($labelingGroupId);
        if ($labelingGroup === null) {
            throw new \Exception('There is no labeling group with the id ' . $labelingGroupId);
        }
        $projects = $this->projectFacade->findAll();
        $progress = new ProgressBar($output, count($projects));

        /** @var Model\Project $project */
        foreach ($projects as $project) {
            if ($project->getLabelingGroupId() === null) {
                $project->setLabelingGroupId(
                    $labelingGroupId
                );
                $this->projectFacade->save($project);
            }

            $progress->advance();
        }
        $progress->finish();
    }
}
