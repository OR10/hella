<?php

namespace FileSystemBundle\Tests;

use AppBundle\Database;
use AppBundle\Model\User;
use DataStationBundle\Security\DataStationPermissionProvider;
use Doctrine\CouchDB\CouchDBClient;
use FOS\UserBundle\Model\UserManagerInterface;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;
use Phake;
use PHPUnit_Framework_Assert;
use Symfony\Bundle\FrameworkBundle\Test;

/**
 * Common base class for FileSystem TestCases.
 */
class BaseTestCase extends Test\KernelTestCase
{
    const BUNDLE_NAME = 'FileSystemBundle';

    /**
     * @var string[]
     */
    protected $temporaryDirectories = [];

    /**
     * Setup test case.
     */
    public function setUp()
    {
        static::$class = null;

        parent::setUp();
    }

    /**
     * Tear down test case.
     */
    public function tearDown()
    {
        $this->removeTemporaryDirectories();

        parent::tearDown();
    }

    /**
     * Get the DI container.
     */
    protected function getContainer()
    {
        return static::$kernel->getContainer();
    }

    /**
     * Get the service identified by $name.
     *
     * @param string $name
     *
     * @return mixed
     */
    protected function getService($name)
    {
        return $this->getContainer()->get($name);
    }

    /**
     * @param string $id
     * @param string $className
     *
     * @return mixed
     */
    protected function mockService(string $id, string $className)
    {
        $serviceMock = Phake::mock($className);

        $this->getContainer()->set($id, $serviceMock);

        return $serviceMock;
    }

    /**
     * Clone the given directory to a temporary directory that can be used by
     * tests.
     *
     * @param string $sourceDirectory
     *
     * @return string|null the temporary location
     */
    protected function createTemporaryDirectory(string $sourceDirectory = null)
    {
        $temporaryDirectory = tempnam(sys_get_temp_dir(), 'audidv-');
        if (is_file($temporaryDirectory)) {
            unlink($temporaryDirectory);
        }

        mkdir($temporaryDirectory);

        if ($sourceDirectory !== null) {
            $this->copyDirectory($sourceDirectory, $temporaryDirectory);
        }

        $this->temporaryDirectories[] = $temporaryDirectory;

        return $temporaryDirectory;
    }

    protected function copyDirectory(string $sourceDirectory, string $destinationDirectory)
    {
        if (!is_dir($destinationDirectory)) {
            mkdir($destinationDirectory);
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator(
                $sourceDirectory,
                \RecursiveDirectoryIterator::SKIP_DOTS | \RecursiveDirectoryIterator::FOLLOW_SYMLINKS
            ),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $item) {
            $itemPath = $destinationDirectory . DIRECTORY_SEPARATOR . $iterator->getSubPathName();
            if ($item->isDir()) {
                if (!is_dir($itemPath)) {
                    mkdir($itemPath, 0777);
                }
            } else {
                copy($item, $itemPath);
            }
        }
    }

    private function removeTemporaryDirectories()
    {
        foreach ($this->temporaryDirectories as $directory) {
            if (!file_exists($directory)) {
                continue;
            }

            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::CHILD_FIRST
            );

            foreach ($files as $fileinfo) {
                if ($fileinfo->isDir()) {
                    rmdir($fileinfo->getRealPath());
                } else {
                    unlink($fileinfo->getRealPath());
                }
            }

            rmdir($directory);
        }

        $this->temporaryDirectories = [];
    }
}
