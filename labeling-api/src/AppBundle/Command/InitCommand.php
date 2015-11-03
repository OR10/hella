<?php

namespace AppBundle\Command;

use Doctrine\CouchDB;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class InitCommand extends BaseCommand
{
    /**
     * @var CouchDB\CouchDBClient
     */
    private $couchClient;

    /**
     * @var string
     */
    private $couchDatabase;

    /**
     * @var string
     */
    private $userPassword;

    public function __construct(
        CouchDB\CouchDBClient $couchClient,
        $couchDatabase,
        $userPassword,
        $cacheDir,
        $frameCdnDir
    ) {
        parent::__construct();

        $this->couchClient   = $couchClient;
        $this->couchDatabase = (string) $couchDatabase;
        $this->userPassword  = (string) $userPassword;
        $this->cacheDir      = (string) $cacheDir;
        $this->frameCdnDir   = (string) $frameCdnDir;
    }

    protected function configure()
    {
        $this->setName('annostation:init')
            ->setDescription('Initializes the database to a clean known state')
            ->addOption(
                'drop-database',
                null,
                InputOption::VALUE_NONE,
                'Drop entire database. Otherwise just the schema is dropped.'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->initializeDatabase($output, $input->getOption('drop-database'))) {
            return 1;
        }

        if (!$this->initializeCouchDatabase($output)) {
            return 1;
        }

        if (!$this->createUser($output)) {
            return 1;
        }

        if (!$this->clearDirectories($output)) {
            return 1;
        }
    }

    private function initializeDatabase(OutputInterface $output, $dropDatabase)
    {
        $this->writeSection($output, 'Initializing database');

        if ($dropDatabase) {
            $this->writeVerboseInfo($output, 'dropping database');
            if (!$this->runCommand($output, 'doctrine:database:drop', [
                '--force' => true,
                '--if-exists' => true,
            ])) {
                return false;
            }

            $this->writeVerboseInfo($output, 'creating database');
            if (!$this->runCommand($output, 'doctrine:database:create')) {
                return false;
            }
        } else {
            $this->writeVerboseInfo($output, 'dropping database schema');
            if (!$this->runCommand($output, 'doctrine:schema:drop', [
                '--force' => true,
            ])) {
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
            $this->writeVerboseInfo($output, 'dropping couch database');
            $this->couchClient->deleteDatabase($this->couchDatabase);
            $this->writeVerboseInfo($output, 'creating couch database');
            $this->couchClient->createDatabase($this->couchDatabase);
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

    private function createUser(OutputInterface $output)
    {
        $this->writeSection($output, 'Creating users');

        if ($this->userPassword !== null) {
            if (!$this->runCommand($output, 'fos:user:create', [
                'username'         => 'user',
                'email'            => 'user@example.com',
                'password'         => $this->userPassword,
            ])) {
                return false;
            }

            $this->writeInfo(
                $output,
                "Created user <comment>user</comment> with password: <comment>{$this->userPassword}</>"
            );
        } else {
            $this->writeInfo($output, "<comment>User 'user' is not created due to an empty password!</comment>");
        }

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
}
