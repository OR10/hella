<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console;
use AnnoStationBundle\Worker\Jobs;
use crosscan\WorkerPool;

class CopyLabelGroupCoordinatorsToLabelManagers extends Command\Base
{
    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * TaskDocumentsToTaskDatabase constructor.
     *
     * @param Facade\Organisation  $organisationFacade
     * @param Facade\LabelingGroup $labelingGroupFacade
     */
    public function __construct(Facade\Organisation $organisationFacade, Facade\LabelingGroup $labelingGroupFacade)
    {
        parent::__construct();
        $this->organisationFacade  = $organisationFacade;
        $this->labelingGroupFacade = $labelingGroupFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:migrations:copy-label-group-coordinators-to-label-managers');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $organisations = $this->organisationFacade->findAll();
        foreach ($organisations as $organisation) {
            $labelGroups = $this->labelingGroupFacade->findAllByOrganisation($organisation)->toArray();
            foreach ($labelGroups as $labelGroup) {
                if ($labelGroup->getLabelManagers() === null) {
                    $labelGroup->setLabelManagers($labelGroup->getCoordinators());

                    $this->labelingGroupFacade->save($labelGroup);
                    $output->writeln('<info>Updated: ' . $labelGroup->getId() . '</info>');
                }else{
                    $output->writeln('<error>Skipped: ' . $labelGroup->getId() . '</error>');
                }
            }
        }
    }
}
