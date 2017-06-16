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

class Init extends Base
{
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
     * @var bool
     */
    private $pouchdbFeatureEnabled;

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
     * @param bool                                         $pouchdbFeatureEnabled
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
        $couchReadOnlyUser,
        $pouchdbFeatureEnabled
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
        $this->pouchdbFeatureEnabled            = $pouchdbFeatureEnabled;
    }

    protected function configure()
    {
        $this->setName('annostation:init')
            ->setDescription('Initializes the database to a clean known state')
            ->addOption(
                'video-base-path',
                null,
                InputOption::VALUE_REQUIRED,
                'Base path for importing videos',
                'http://192.168.123.7'
            )
            ->addOption(
                'drop-database',
                null,
                InputOption::VALUE_NONE,
                'Drop entire database. Otherwise just the schema is dropped.'
            )
            ->addOption(
                'skip-import',
                null,
                InputOption::VALUE_NONE,
                'Skip import of initial video file.'
            )
            ->addOption(
                'lossless',
                null,
                InputOption::VALUE_NONE,
                'Generate lossless compressed PNGs instead of JPGs.'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->clearDirectories($output)) {
            return 1;
        }

        if (!$this->initializeDatabase($output, $input->getOption('drop-database'))) {
            return 1;
        }

        if (!$this->initializeCouchDatabase($output)) {
            return 1;
        }

        if (!$this->setupRabbitmq($output)) {
            return 1;
        }

        if (!$this->createUsers($output)) {
            return 1;
        }

        if (!$this->createLabelGroup($output)) {
            return 1;
        }

        if (!$this->addXmlConfiguration($output)) {
            return 1;
        }

        if (!$this->downloadSampleVideo(
            $output,
            $input->getOption('video-base-path'),
            $input->getOption('skip-import'),
            $input->getOption('lossless')
        )
        ) {
            return 1;
        }
    }

    private function initializeDatabase(OutputInterface $output, $dropDatabase)
    {
        $this->writeSection($output, 'Initializing database');

        if ($dropDatabase) {
            $this->writeVerboseInfo($output, 'dropping database');
            if (!$this->runCommand(
                $output,
                'doctrine:database:drop',
                [
                    '--force'     => true,
                    '--if-exists' => true,
                ]
            )
            ) {
                return false;
            }

            $this->writeVerboseInfo($output, 'creating database');
            if (!$this->runCommand($output, 'doctrine:database:create')) {
                return false;
            }
        } else {
            $this->writeVerboseInfo($output, 'dropping database schema');
            if (!$this->runCommand(
                $output,
                'doctrine:schema:drop',
                [
                    '--force' => true,
                ]
            )
            ) {
                return false;
            }
        }

        $this->writeVerboseInfo($output, 'creating database schema');
        if (!$this->runCommand($output, 'doctrine:schema:create')) {
            return false;
        }

        return true;
    }

    private function initializeCouchDatabase(OutputInterface $output)
    {
        $this->writeSection($output, 'Initializing couch database');

        try {
            $this->writeVerboseInfo($output, 'dropping couch databases');
            $this->couchClient->deleteDatabase($this->couchDatabase);
            $this->couchClient->deleteDatabase($this->couchDatabaseReadOnly);
            foreach ($this->couchClient->getAllDatabases() as $database) {
                if (strpos($database, 'taskdb-project-') === 0) {
                    $this->couchClient->deleteDatabase($database);
                }
            }
            $this->writeVerboseInfo($output, 'dropping couchdb annostation_ users');
            $this->couchDbUsersFacade->purgeCouchDbsUserDatabase(Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX);

            $this->writeVerboseInfo($output, 'creating couch databases');
            $this->couchClient->createDatabase($this->couchDatabase);
            $this->couchClient->createDatabase($this->couchDatabaseReadOnly);
            $this->createSecurityDocument($this->couchDatabase);
            $this->createSecurityDocument($this->couchDatabaseReadOnly);
        } catch (\Exception $e) {
            $this->writeError($output, "Error deleting couch database: {$e->getMessage()}");

            return false;
        }

        $this->writeVerboseInfo($output, 'updating design-docs');
        if (!$this->runCommand($output, 'doctrine:couchdb:update-design-doc')) {
            return false;
        }

        return true;
    }

    private function createSecurityDocument($database)
    {
        if (!$this->pouchdbFeatureEnabled) {
            return;
        }
        $this->couchDbSecurityFacade->updateSecurity(
            $database,
            [$this->couchUser, $this->couchReadOnlyUser]
        );
    }

    private function getOrganisation()
    {
        if ($this->organisation === null) {
            $organisation       = new AnnoStationBundleModel\Organisation('Default Organisation');
            $this->organisation = $this->organisationFacade->save($organisation);
        }

        return $this->organisation;
    }

    private function createUsers(OutputInterface $output)
    {
        $this->writeSection($output, 'Creating users');

        $users = ['admin', 'label_coordinator', 'user', 'client', 'superadmin'];

        if ($this->userPassword !== null) {
            foreach ($users as $username) {
                $user = $this->userFacade->createUser(
                    $username,
                    $username . '@example.com',
                    $this->userPassword,
                    true,
                    false,
                    [],
                    [$this->getOrganisation()->getId()]
                );

                switch ($username) {
                    case 'superadmin':
                        $roleNames = [
                            Model\User::ROLE_SUPER_ADMIN,
                        ];
                        break;
                    case 'admin':
                        $roleNames = [
                            Model\User::ROLE_ADMIN,
                            Model\User::ROLE_LABEL_COORDINATOR,
                            Model\User::ROLE_CLIENT,
                        ];
                        break;
                    case 'label_coordinator':
                        $roleNames = [Model\User::ROLE_LABEL_COORDINATOR];
                        break;
                    case 'client':
                        $roleNames = [Model\User::ROLE_CLIENT];
                        break;
                    case 'user':
                        $roleNames = [Model\User::ROLE_LABELER];
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
                        $username,
                        $this->userPassword
                    )
                );
            }
        } else {
            $this->writeInfo($output, "<comment>Users are not created due to an empty password!</comment>");
        }

        return true;
    }

    private function createLabelGroup(OutputInterface $output)
    {
        if (!isset($this->users['label_coordinator']) || !isset($this->users['user'])) {
            return false;
        }

        $labelGroup = new Model\LabelingGroup(
            $this->getOrganisation(),
            [$this->users['label_coordinator']->getId()],
            [$this->users['user']->getId()],
            'Example Labeling Group'
        );

        $this->labelingGroupFacade->save($labelGroup);

        $this->writeSection($output, 'Added new LabelGroup for label_coordinator and user');

        return true;
    }

    private function clearDirectories(OutputInterface $output)
    {
        $this->writeSection($output, 'Clear directories');

        $this->writeVerboseInfo($output, "clearing {$this->cacheDir}");
        if (!$this->clearDirectory($this->cacheDir)) {
            return false;
        }

        $this->writeVerboseInfo($output, "clearing {$this->frameCdnDir}");
        if (!$this->clearDirectory($this->frameCdnDir)) {
            return false;
        }

        return true;
    }

    private function setupRabbitmq(OutputInterface $output)
    {
        $this->writeSection($output, 'Setup queues');

        return $this->runCommand($output, 'annostation:rabbitmq:setup');
    }

    private function clearDirectory($directory)
    {
        $entries = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator(
                $directory,
                \RecursiveDirectoryIterator::SKIP_DOTS
            ),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($entries as $info) {
            if ($info->getFilename() == '.gitignore' || $info->getFilename() == '.gitkeep') {
                continue;
            }
            $todo = ($info->isDir() ? 'rmdir' : 'unlink');
            if (!$todo($info->getRealPath())) {
                return false;
            }
        }

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
            $this->getOrganisation(),
            'Sample Configuration',
            'example.xml',
            'application/xml',
            $xmlData,
            $this->users['client']->getId(),
            $taskConfigurationXmlConverter->convertToJson()
        );

        $this->taskConfigurationFacade->save($config);

        $this->writeSection($output, 'Added new Sample Task Configuration for the Client User');
    }

    private function downloadSampleVideo(OutputInterface $output, string $videoBasePath, $skipImport, $lossless)
    {
        $this->writeSection($output, 'Video Import');

        if ($skipImport) {
            $this->writeInfo($output, 'skipping video import');

            return true;
        }

        try {
            $project = Model\Project::create('Example project', null, null, null, [], 1, 1, 0);

            $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_PERSON, 'pedestrian');
            $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_VEHICLE, 'rectangle');

            $this->projectFacade->save($project);

            $this->importVideos($project, $videoBasePath, ['anno_short.avi', 'anno_night.avi'], $output, $lossless);
        } catch (\Exception $e) {
            $this->writeError($output, $e->getMessage());

            return false;
        }

        return true;
    }

    /**
     * @param Model\Project   $project
     * @param string          $videoBasePath
     * @param array           $fileNames
     * @param OutputInterface $output
     * @param                 $lossless
     */
    private function importVideos(
        Model\Project $project,
        string $videoBasePath,
        array $fileNames,
        OutputInterface $output,
        $lossless
    ) {
        foreach ($fileNames as $fileName) {
            $sourcePath = sprintf('%s/%s', $videoBasePath, $fileName);
            $this->writeInfo($output, sprintf('Importing default video <comment>%s</comment>', $sourcePath));
            $path = tempnam($this->cacheDir, 'anno_sample_videos');
            file_put_contents($path, file_get_contents($sourcePath));

            $video = $this->videoImporterService->importVideo($project, $fileName, $path, $lossless);

            $this->taskCreator->createTasks($project, $video, $this->users['admin']);
        }
    }
}
