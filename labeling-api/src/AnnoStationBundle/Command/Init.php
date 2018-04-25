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
    private $couchPassword;

    /**
     * @var string
     */
    private $couchReadOnlyUser;

    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

    /**
     * @var string
     */
    private $couchHost;

    /**
     * @var string
     */
    private $couchPort;

    /**
     * @var string
     */
    private $couchExternalUrl;

    /**
     * Init constructor.
     *
     * @param CouchDB\CouchDBClient $couchClient
     * @param Service\VideoImporter $videoImporterService
     * @param Service\TaskCreator $taskCreator
     * @param string $couchDatabase
     * @param string $couchDatabaseReadOnly
     * @param string $userPassword
     * @param string $cacheDir
     * @param string $frameCdnDir
     * @param AppFacade\User $userFacade
     * @param Facade\Project $projectFacade
     * @param Facade\LabelingGroup $labelingGroupFacade
     * @param Facade\TaskConfiguration $taskConfigurationFacade
     * @param Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory
     * @param Facade\Organisation $organisationFacade
     * @param AppFacade\CouchDbUsers $couchDbUsersFacade
     * @param AppFacade\CouchDbSecurity $couchDbSecurityFacade
     * @param Service\UserRolesRebuilder $userRolesRebuilderService
     * @param string $couchUser
     * @param string $couchPassword
     * @param string $couchReadOnlyUser
     * @param  GuzzleHttp\Client $guzzleClient
     * @param string $couchHost
     * @param string $couchPort
     * @param string $couchExternalUrl
     */
    public function __construct(
        CouchDB\CouchDBClient $couchClient,
        Service\VideoImporter $videoImporterService,
        Service\TaskCreator $taskCreator,
        string $couchDatabase,
        string $couchDatabaseReadOnly,
        string $userPassword,
        string $cacheDir,
        string $frameCdnDir,
        AppFacade\User $userFacade,
        Facade\Project $projectFacade,
        Facade\LabelingGroup $labelingGroupFacade,
        Facade\TaskConfiguration $taskConfigurationFacade,
        Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory,
        Facade\Organisation $organisationFacade,
        AppFacade\CouchDbUsers $couchDbUsersFacade,
        AppBundleFacade\CouchDbSecurity $couchDbSecurityFacade,
        Service\UserRolesRebuilder $userRolesRebuilderService,
        string $couchUser,
        string $couchPassword,
        string $couchReadOnlyUser,
        GuzzleHttp\Client $guzzleClient,
        string $couchHost,
        string $couchPort,
        string $couchExternalUrl
    )
    {
        parent::__construct();

        $this->couchClient = $couchClient;
        $this->videoImporterService = $videoImporterService;
        $this->taskCreator = $taskCreator;
        $this->couchDatabase = (string)$couchDatabase;
        $this->couchDatabaseReadOnly = (string)$couchDatabaseReadOnly;
        $this->userPassword = (string)$userPassword;
        $this->cacheDir = (string)$cacheDir;
        $this->frameCdnDir = (string)$frameCdnDir;
        $this->userFacade = $userFacade;
        $this->projectFacade = $projectFacade;
        $this->labelingGroupFacade = $labelingGroupFacade;
        $this->configurationXmlConverterFactory = $configurationXmlConverterFactory;
        $this->taskConfigurationFacade = $taskConfigurationFacade;
        $this->organisationFacade = $organisationFacade;
        $this->couchDbUsersFacade = $couchDbUsersFacade;
        $this->couchDbSecurityFacade = $couchDbSecurityFacade;
        $this->userRolesRebuilderService = $userRolesRebuilderService;
        $this->couchUser = $couchUser;
        $this->couchPassword = $couchPassword;
        $this->couchReadOnlyUser = $couchReadOnlyUser;
        $this->guzzleClient = $guzzleClient;
        $this->couchHost = $couchHost;
        $this->couchPort = $couchPort;
        $this->couchExternalUrl = $couchExternalUrl;
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
            $output->writeln("clearDirectories failed");

            return 1;
        }

        if (!$this->initializeCouchDatabase($output)) {
            $output->writeln("initializeCouchDatabase failed");

            return 1;
        }

        if (!$this->setupRabbitmq($output)) {
            $output->writeln("setupRabbitmq failed");

            return 1;
        }

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
        //Disabled because it is broken for more than 1 year
//        if (!$this->downloadSampleVideo(
//            $output,
//            $input->getOption('video-base-path'),
//            $input->getOption('skip-import'),
//            $input->getOption('lossless')
//        )
//        ) {
//            return 1;
//        }
    }

    protected function prepareCouchUrl() {
        return sprintf(
            'http://%s:%s@%s:%s/',
            $this->couchUser,
            $this->couchPassword,
            $this->couchHost,
            $this->couchPort
        );
    }

    /**
     * Couchdb 2.1 doesn't do it automatically
     */
    protected function setupCouchdb()
    {
        $data = [
            'action' => 'enable_single_node',
            'bind_address' => '0.0.0.0',
            'password' => $this->couchPassword,
            'port' => 5984,
            'singlenode' => true,
            'username' => $this->couchUser,
        ];

        $params = [GuzzleHttp\RequestOptions::JSON => $data];

        $this->guzzleClient->post($this->prepareCouchUrl() . '_cluster_setup', $params);
    }

    protected function guzzleSendBody($url, $data, $method)
    {
        $url = $this->prepareCouchUrl() . $url;
        $params = ['body' => $data];
        $this->guzzleClient->request($method, $url, $params);
    }

    private function enableCouchCors()
    {
        $url = '_node/nonode@nohost/_config/httpd/enable_cors';
        $data = '"true"';
        $this->guzzleSendBody($url, $data, 'PUT');

        $url = '_node/nonode@nohost/_config/cors/origins';
        $data = '"' . $this->couchExternalUrl . '"';
        $this->guzzleSendBody($url, $data, 'PUT');

        $url = '_node/nonode@nohost/_config/cors/credentials';
        $data = '"true"';
        $this->guzzleSendBody($url, $data, 'PUT');

        $url = '_node/nonode@nohost/_config/cors/headers';
        $data = '"accept, authorization, content-type, origin, referer, x-csrf-token"';
        $this->guzzleSendBody($url, $data, 'PUT');

        $url = '_node/nonode@nohost/_config/cors/methods';
        $data = '"GET, PUT, POST, HEAD, DELETE"';
        $this->guzzleSendBody($url, $data, 'PUT');
    }

    private function initializeCouchDatabase(OutputInterface $output)
    {
        $this->writeSection($output, 'Initializing couch database');

        $this->writeVerboseInfo($output, 'Setup couchdb');
        $this->setupCouchdb();

        $this->writeVerboseInfo($output, 'Enable CORS headers');
        $this->enableCouchCors();

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

        $users = ['superadmin', 'label_manager', 'labeler', 'observer', 'ext_coordinator'];

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
        if (!isset($this->users['label_manager'])) {
            return false;
        }

        $labelGroup = new Model\LabelingGroup(
            $this->getOrganisation(),
            [$this->users['label_manager']->getId()],
            [$this->users['labeler']->getId()],
            'Example Labeling Group'
        );

        $this->labelingGroupFacade->save($labelGroup);

        $this->writeSection($output, 'Added new LabelGroup for label_manager and user');

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
            $this->users['label_manager']->getId(),
            $taskConfigurationXmlConverter->convertToJson()
        );

        $this->taskConfigurationFacade->save($config);

        $this->writeSection($output, 'Added new Sample Task Configuration for the LabelManager User');

        return true;
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

            $this->taskCreator->createTasks($project, $video, $this->users['label_manager']);
        }
    }
}
