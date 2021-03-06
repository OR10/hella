<?php
namespace AnnoStationBundle\Command;

use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppFacade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AppBundle\Model\TaskConfiguration;
use Doctrine\CouchDB;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use AppBundle\Database\Facade as AppBundleFacade;
use GuzzleHttp;

class LoadTest extends Base
{
    private $totalOrganisations = 50;
    private $totalLabelers = 150;
    private $totalProjects = 500;

    /**
     * @var Model\LabelingGroup
     */
    private $labelingGroup;

    /**
     * @var CouchDB\CouchDBClient
     */
    private $couchClient;

    /**
     * @var Service\VideoImporter
     */
    private $videoImporterService;

    /**
     * @var Service\TaskCreator
     */
    private $taskCreator;

    /**
     * @var string
     */
    private $couchDatabase;

    /**
     * @var string
     */
    private $couchDatabaseReadOnly;

    /**
     * @var string
     */
    private $userPassword;

    /**
     * @var AppFacade\User
     */
    private $userFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Model\User[]
     */
    private $users = [];

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Service\TaskConfigurationXmlConverterFactory
     */
    private $configurationXmlConverterFactory;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    /**
     * @var AppFacade\CouchDbUsers
     */
    private $couchDbUsersFacade;

    /**
     * @var AppFacade\CouchDbSecurity
     */
    private $couchDbSecurityFacade;

    /**
     * @var Service\UserRolesRebuilder
     */
    private $userRolesRebuilderService;

    /**
     * @var string
     */
    private $couchUser;

    /**
     * @var string
     */
    private $couchReadOnlyUser;

    /**
     * Init constructor.
     *
     * @param CouchDB\CouchDBClient                        $couchClient
     * @param Service\VideoImporter                        $videoImporterService
     * @param Service\TaskCreator                          $taskCreator
     * @param                                              $couchDatabase
     * @param                                              $couchDatabaseReadOnly
     * @param                                              $userPassword
     * @param                                              $cacheDir
     * @param                                              $frameCdnDir
     * @param AppFacade\User                               $userFacade
     * @param Facade\Project                               $projectFacade
     * @param Facade\LabelingGroup                         $labelingGroupFacade
     * @param Facade\TaskConfiguration                     $taskConfigurationFacade
     * @param Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory
     * @param Facade\Organisation                          $organisationFacade
     * @param AppFacade\CouchDbUsers                       $couchDbUsersFacade
     * @param AppFacade\CouchDbSecurity                    $couchDbSecurityFacade
     * @param Service\UserRolesRebuilder                   $userRolesRebuilderService
     * @param string                                       $couchUser
     * @param string                                       $couchReadOnlyUser
     */
    public function __construct(
        CouchDB\CouchDBClient $couchClient,
        Service\VideoImporter $videoImporterService,
        Service\TaskCreator $taskCreator,
        $couchDatabase,
        $couchDatabaseReadOnly,
        $userPassword,
        $cacheDir,
        $frameCdnDir,
        AppFacade\User $userFacade,
        Facade\Project $projectFacade,
        Facade\LabelingGroup $labelingGroupFacade,
        Facade\TaskConfiguration $taskConfigurationFacade,
        Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory,
        Facade\Organisation $organisationFacade,
        AppFacade\CouchDbUsers $couchDbUsersFacade,
        AppBundleFacade\CouchDbSecurity $couchDbSecurityFacade,
        Service\UserRolesRebuilder $userRolesRebuilderService,
        $couchUser,
        $couchReadOnlyUser
    ) {
        parent::__construct();

        $this->couchClient                      = $couchClient;
        $this->videoImporterService             = $videoImporterService;
        $this->taskCreator                      = $taskCreator;
        $this->couchDatabase                    = (string)$couchDatabase;
        $this->couchDatabaseReadOnly            = (string)$couchDatabaseReadOnly;
        $this->userPassword                     = (string)$userPassword;
        $this->cacheDir                         = (string)$cacheDir;
        $this->frameCdnDir                      = (string)$frameCdnDir;
        $this->userFacade                       = $userFacade;
        $this->projectFacade                    = $projectFacade;
        $this->labelingGroupFacade              = $labelingGroupFacade;
        $this->configurationXmlConverterFactory = $configurationXmlConverterFactory;
        $this->taskConfigurationFacade          = $taskConfigurationFacade;
        $this->organisationFacade               = $organisationFacade;
        $this->couchDbUsersFacade               = $couchDbUsersFacade;
        $this->couchDbSecurityFacade            = $couchDbSecurityFacade;
        $this->userRolesRebuilderService        = $userRolesRebuilderService;
        $this->couchUser                        = $couchUser;
        $this->couchReadOnlyUser                = $couchReadOnlyUser;
    }

    protected function configure()
    {
        $this->setName('annostation:loadtest')
            ->setDescription('Add test data');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        ini_set('memory_limit','512M');

        if (!$this->createUsers($output)) {
            $output->writeln("createUsers failed");

            return 1;
        }

        if (!$this->createLabelGroup($output)) {
            $output->writeln("createLabelGroup failed");

            return 1;
        }

        if (!$this->addXmlConfiguration($output)) {
            $output->writeln("addXmlConfiguration failed");

            return 1;
        }

        if (!$this->downloadSampleVideo(
            $output
        )
        ) {
            return 1;
        }
    }

    private function getOrganisation(OutputInterface $output)
    {
        if ($this->organisation === null) {
            $this->writeSection($output, 'Creating organizations');
            for($i=1;$i<= $this->totalOrganisations;$i++) {
                $this->writeInfo($output, sprintf('#%d', $i));
                $organisation       = new AnnoStationBundleModel\Organisation('Load Test Empty Organisation '.$i);
                $this->organisationFacade->save($organisation);
            }
            $organisation       = new AnnoStationBundleModel\Organisation('Load Test Organisation');
            $this->organisation = $this->organisationFacade->save($organisation);
            $this->writeSection($output, 'Done');
        }

        return $this->organisation;
    }

    private function createUsers(OutputInterface $output)
    {
        $this->writeSection($output, 'Creating users');

        $users = ['superadmin','label_manager','observer', 'ext_coordinator'];

        if ($this->userPassword !== null) {
            //#################### Create labeleres start
            for ($i=1;$i<=$this->totalLabelers; $i++) {
                $username = 'labeler_'.$i;
                $user = $this->userFacade->createUser(
                    $username,
                    $username . '@loadtest_annostation.com',
                    $this->userPassword,
                    true,
                    false,
                    [],
                    [$this->getOrganisation($output)->getId()]
                );

                        

                $user->setRoles([Model\User::ROLE_LABELER]);

                $this->userFacade->updateUser($user);

                $this->userRolesRebuilderService->rebuildForUser($user);

                $this->users[$user->getUsername()] = $user;

                $this->writeInfo(
                    $output,
                    sprintf(
                        'Created user <comment>%s</comment> with password: <comment>%s</comment>',
                        $username,
                        $this->userPassword
                    )
                );
            }
            //#################### Create labeleres end

            //#################### Create other users start
            for($i=1;$i<=5;$i++) {
                foreach ($users as $username) {
                    $user = $this->userFacade->createUser(
                        $username . '_'. $i,
                        $username .'_load-testing_'. $i . '@loadtest_annostation.com',
                        $this->userPassword,
                        true,
                        false,
                        [],
                        [$this->getOrganisation($output)->getId()]
                    );

                    switch ($username) {
                        case 'superadmin':
                            $roleNames = [Model\User::ROLE_SUPER_ADMIN];
                            break;
                        case 'label_manager':
                            $roleNames = [Model\User::ROLE_LABEL_MANAGER];
                            break;
                        case 'labeler':
                            $roleNames = [Model\User::ROLE_LABELER];
                            break;
                        case 'observer':
                            $roleNames = [Model\User::ROLE_OBSERVER];
                            break;
                        case 'ext_coordinator':
                            $roleNames = [Model\User::ROLE_EXTERNAL_COORDINATOR];
                            break;
                        default:
                            $roleNames = 'ROLE_USER';
                    }

                    $user->setRoles($roleNames);

                    $this->userFacade->updateUser($user);

                    $this->userRolesRebuilderService->rebuildForUser($user);

                    $this->users[$user->getUsername()] = $user;

                    $this->writeInfo(
                        $output,
                        sprintf(
                            'Created user <comment>%s</comment> with password: <comment>%s</comment>',
                            $user->getUsername(),
                            $this->userPassword
                        )
                    );
                }
            }
            //#################### Create other users end
        } else {
            $this->writeInfo($output, "<comment>Users are not created due to an empty password!</comment>");
        }

        return true;
    }

    private function createLabelGroup(OutputInterface $output)
    {
        if (!isset($this->users['label_manager_1'])) {
            $output->writeln('label_manager is not found');

            return false;
        }

        $memberIds = [];
        foreach ($this->users as $user) {
            $memberIds[] = $user->getId();
        }

        $labelGroup = new Model\LabelingGroup(
            $this->getOrganisation($output),
            [$this->users['label_manager_1']->getId()],
            $memberIds,
            'Example Labeling Group'
        );

        $this->labelingGroupFacade->save($labelGroup);
        $this->labelingGroup = $labelGroup;
        $this->writeSection($output, 'Added new LabelGroup for label_manager and all of users');

        return true;
    }

    private function addXmlConfiguration(OutputInterface $output)
    {
        $xmlData = '<?xml version="1.0" encoding="UTF-8" ?>
                <labelTaskConfig shape="rectangle" minimalVisibleShapeOverflow="150" minimalHeight="0">
                    <class id="type" name="Type">
                    <value id="person" name="Person"/>
                    <value id="cyclist" name="Cyclist"/>
                </class>
                </labelTaskConfig>';

        $taskConfigurationXmlConverter = $this->configurationXmlConverterFactory->createConverter(
            $xmlData,
            Model\TaskConfiguration\SimpleXml::TYPE
        );
        $config = new TaskConfiguration\SimpleXml(
            $this->getOrganisation($output),
            'Sample Configuration',
            'example.xml',
            'application/xml',
            $xmlData,
            $this->users['label_manager_1']->getId(),
            $taskConfigurationXmlConverter->convertToJson()
        );

        $this->taskConfigurationFacade->save($config);

        $this->writeSection($output, 'Added new Sample Task Configuration for the LabelManager User');

        return true;
    }

    /**
     * @param OutputInterface $output
     * @param string $videoFileDir
     * @param string $zipFile
     * @return string[] files
     */
    private function receiveVideos(OutputInterface $output, string $videoFileDir, string $zipFile)
    {
        $this->writeInfo($output, 'downloading started');
        if (!file_exists($videoFileDir)) {
            mkdir($videoFileDir, 0777, true);
        }

        $httpClient = new GuzzleHttp\Client();
        $resource = fopen($zipFile, 'w');
        $httpClient->request('GET', 'https://sst.by/videos.zip', ['sink' => $resource]);
        $zip = new \ZipArchive();
        if ($zip->open($zipFile) === true) {
            $zip->extractTo(realpath($videoFileDir . '/../'));
            $zip->close();
        }
        $this->writeInfo($output, 'downloading finished');

        return array_diff(scandir($videoFileDir), ['..', '.']);
    }

    private function downloadSampleVideo(OutputInterface $output)
    {
        $this->writeSection($output, 'Video Import');
        $skipImport = false;
        if ($skipImport) {
            $this->writeInfo($output, 'skipping video import');

            return true;
        }

        $videoFileDir = '/tmp/hella/videos';
        $videoFileList = $this->receiveVideos($output, $videoFileDir, '/tmp/hella/videos.zip');

        $lossless = true;
        try {
            
            $projectStatuses = [
                Model\Project::STATUS_TODO,
                Model\Project::STATUS_IN_PROGRESS,
                Model\Project::STATUS_DELETED,
                Model\Project::STATUS_DONE,
            ];

            $user = $this->userFacade->getUserByUsername('superadmin');

            $this->writeInfo($output, 'Creation of projects without video');
            for($i=1;$i<=$this->totalProjects;$i++) {
                $project = Model\Project::create('Example project '.$i, $this->getOrganisation($output));
                $status = $projectStatuses[rand(0,count($projectStatuses)-1)];
                
                for($a=1; $a<=100; $a++) {
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_CYCLIST, 'rectangle');
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_IGNORE, 'rectangle');
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_PERSON, 'rectangle');
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE, 'rectangle');
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_PARKED_CARS, 'rectangle');
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_VEHICLE, 'rectangle');
                }

                $this->projectFacade->save($project);
                $date = new \DateTime('now', new \DateTimeZone('UTC'));
                $date->modify('+1 second');
                 $project->addStatusHistory(
                    $date,
                    $status,
                    $user
                );
                $this->projectFacade->save($project);
            }
            $this->writeInfo($output, 'Creation of projects without video... done');

            $this->writeInfo($output, 'Creation of projects with video');
            for($i=200;$i<=205;$i++) {
                $project = Model\Project::create('Example project with videos ' . $i, $this->getOrganisation($output));
                for($a=1; $a<=100; $a++) {
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_CYCLIST, 'rectangle');
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_IGNORE, 'rectangle');
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_PERSON, 'rectangle');
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE, 'rectangle');
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_PARKED_CARS, 'rectangle');
                    $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_VEHICLE, 'rectangle');
                }

                if (rand(0, 1)) {
                    $date = new \DateTime('now', new \DateTimeZone('UTC'));
                    $date->modify('+1 second');
                    $project->addStatusHistory( $date, Model\Project::STATUS_IN_PROGRESS, $user);
                }

                $this->projectFacade->save($project);
                $this->importVideos($project, $videoFileDir, $videoFileList, $output, $lossless);
            }

            $this->writeInfo($output, 'Creation of projects with video... done');
        } catch (\Exception $e) {
            $this->writeError($output, $e->getMessage());

            return false;
        }

        $this->writeSection($output, 'Video Import is done');

        return true;
    }

    /**
     * @param Model\Project   $project
     * @param string          $videoBasePath
     * @param array           $fileNames
     * @param OutputInterface $output
     * @param                 $lossless
     * @throws \Doctrine\ODM\CouchDB\UpdateConflictException
     * @throws \Exception
     */
    private function importVideos(
        Model\Project $project,
        string $videoBasePath,
        array $fileNames,
        OutputInterface $output,
        $lossless
    ) {
        $this->writeInfo($output, sprintf('Videos count in folder: %d', count($fileNames)));
        foreach ($fileNames as $fileName) {
            $sourcePath = sprintf('%s/%s', $videoBasePath, $fileName);
            $this->writeInfo($output, sprintf('Importing default video <comment>%s</comment>', $sourcePath));
            $path = tempnam($this->cacheDir, 'anno_sample_videos');
            file_put_contents($path, file_get_contents($sourcePath));

            $video = $this->videoImporterService
                ->importVideo($this->getOrganisation($output), $project, $fileName, $path, $lossless);

            $this->taskCreator->createTasks($project, $video, $this->users['label_manager_1']);
        }
    }
}