<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppFacade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use Symfony\Component\Console;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input;

class AddDefaultOrganisation extends Command\Base
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var AppFacade\User
     */
    private $userFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    public function __construct(
        CouchDB\DocumentManager $documentManager,
        Facade\Organisation $organisationFacade,
        Facade\Project $projectFacade,
        Facade\TaskConfiguration $taskConfigurationFacade,
        Facade\LabelingGroup $labelingGroupFacade,
        Facade\Video $videoFacade,
        Facade\CalibrationData $calibrationDataFacade,
        AppFacade\User $userFacade
    ) {
        parent::__construct();
        $this->documentManager         = $documentManager;
        $this->organisationFacade      = $organisationFacade;
        $this->userFacade              = $userFacade;
        $this->projectFacade           = $projectFacade;
        $this->taskConfigurationFacade = $taskConfigurationFacade;
        $this->labelingGroupFacade     = $labelingGroupFacade;
        $this->videoFacade             = $videoFacade;
        $this->calibrationDataFacade   = $calibrationDataFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:migrate:add-default-organisation')
            ->addArgument('organisationId', Input\InputArgument::OPTIONAL, 'Set an existing organisation');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        if ($input->getArgument('organisationId') === null) {
            $organisation = $this->organisationFacade->save(
                new AnnoStationBundleModel\Organisation('Default Organisation')
            );
            $this->writeInfo($output, 'Created a new organisation with id ' . $organisation->getId());
        } else {
            $organisation = $this->organisationFacade->find($input->getArgument('organisationId'));
            if ($organisation === null) {
                throw new \RuntimeException(
                    'There is no organisation with id ' . $input->getArgument('organisationId')
                );
            }
            $this->writeInfo($output, 'Using existing organisation with id ' . $organisation->getId());
        }

        $users           = $this->getUsers();
        $projects        = $this->getProjects();
        $requirementsXml = $this->getRequirementsXml();
        $labelingGroups  = $this->getLabelingGroups();
        $videos          = $this->getVideos();
        $calibrationData = $this->getCalibrationData();

        $numberOfDocs = count($users) + count($projects) + count($requirementsXml) + count($labelingGroups) + count(
                $videos
            ) + count($calibrationData);

        $this->documentManager->clear();

        $progress = new ProgressBar($output, $numberOfDocs);
        $progress->setFormat(
            "%current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% (%step%/6 %stepName%)"
        );

        $progress->setMessage(1, 'step');
        $progress->setMessage('Updating Users', 'stepName');
        foreach ($users as $user) {
            /** @var Model\User $user */
            $user = $this->userFacade->getUserById($user->getId());
            $user->assignToOrganisation($organisation);
            $this->userFacade->updateUser($user);

            $this->documentManager->clear();
        }

        $progress->setMessage(2, 'step');
        $progress->setMessage('Updating Projects', 'stepName');
        foreach ($projects as $project) {
            $project = $this->projectFacade->find($project->getId());
            $project->setOrganisationId($organisation->getId());
            $this->projectFacade->save($project);

            $this->documentManager->clear();
            $progress->advance();
        }

        $progress->setMessage(3, 'step');
        $progress->setMessage('Updating Task Configurations', 'stepName');
        foreach ($requirementsXml as $requirementXml) {
            $requirementXml = $this->taskConfigurationFacade->find($requirementXml->getId());
            $requirementXml->setOrganisationId($organisation->getId());
            $this->taskConfigurationFacade->save($requirementXml);

            $this->documentManager->clear();
            $progress->advance();
        }

        $progress->setMessage(4, 'step');
        $progress->setMessage('Updating LabelingGroups', 'stepName');
        foreach ($labelingGroups as $labelingGroup) {
            $labelingGroup = $this->labelingGroupFacade->find($labelingGroup->getId());
            $labelingGroup->setOrganisationId($organisation->getId());
            $this->labelingGroupFacade->save($labelingGroup);

            $this->documentManager->clear();
            $progress->advance();
        }

        $progress->setMessage(5, 'step');
        $progress->setMessage('Updating Videos', 'stepName');
        foreach ($videos as $video) {
            $video = $this->videoFacade->find($video->getId());
            $video->setOrganisationId($organisation->getId());
            $this->videoFacade->save($video);

            $this->documentManager->clear();
            $progress->advance();
        }

        $progress->setMessage(6, 'step');
        $progress->setMessage('Updating Calibration Data', 'stepName');
        foreach ($calibrationData as $calibration) {
            $calibration = $this->calibrationDataFacade->findById($calibration->getId());
            $calibration->setOrganisationId($organisation->getId());
            $this->calibrationDataFacade->save($calibration);

            $this->documentManager->clear();
            $progress->advance();
        }

        $progress->finish();
    }

    private function getUsers()
    {
        return $this->documentManager
            ->createQuery('annostation_migrations', 'user_by_id')
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    private function getProjects()
    {
        return $this->documentManager
            ->createQuery('annostation_migrations', 'project_by_id')
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    private function getRequirementsXml()
    {
        return $this->documentManager
            ->createQuery('annostation_migrations', 'requirementsxml_by_id')
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    private function getLabelingGroups()
    {
        return $this->documentManager
            ->createQuery('annostation_migrations', 'labeling_group_by_id')
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    private function getVideos()
    {
        return $this->documentManager
            ->createQuery('annostation_migrations', 'video_by_id')
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    private function getCalibrationData()
    {
        return $this->documentManager
            ->createQuery('annostation_migrations', 'calibration_data_by_id')
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }
}
