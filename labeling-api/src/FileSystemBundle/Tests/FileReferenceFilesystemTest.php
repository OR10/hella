<?php

namespace FileSystemBundle\Service;

use FileSystemBundle\Model\FileReference;
use FileSystemBundle\Model\ShareFileReference;
use FileSystemBundle\Tests\BaseTestCase;
use League\Flysystem\Adapter\Local;
use League\Flysystem\FileNotFoundException;
use League\Flysystem\Filesystem;
use League\Flysystem\Plugin\ListFiles;
use Phake;

/**
 * @group FileSystemBundle
 * @group UnitTests
 */
class FileReferenceFilesystemTest extends BaseTestCase
{

    /**
     * @var string
     */
    private $fileSystemDirectory;

    /**
     * @var ShareRegistry
     */
    private $shareRegistry;

    /**
     * @var FileReferenceFilesystem
     */
    private $fileReferenceFilesystem;

    /**
     * @var FileSystem
     */
    private $fileSystem;

    public function setUp()
    {
        parent::setUp();
        $this->createTemporaryFileHandler();
    }

    public function testFileExists()
    {
        $fileReference = new ShareFileReference('test', 'test.txt');

        $this->assertFalse($this->fileReferenceFilesystem->exists($fileReference));

        $this->fileSystem->write($this->fileSystemDirectory . "/test.txt", "test");

        $this->assertTrue($this->fileReferenceFilesystem->exists($fileReference));
    }

    public function testGetFileContentValidFile()
    {
        $this->fileSystem->write($this->fileSystemDirectory . "/test.txt", "test");

        $this->assertEquals(
            "test",
            $this->fileReferenceFilesystem->getFileContent(new ShareFileReference('test', 'test.txt'))
        );
    }

    public function testCreateAndRemoveDirectory()
    {
        $dir = new ShareFileReference('test', '/test123');

        $this->assertFalse($this->fileReferenceFilesystem->exists($dir));
        $this->assertTrue($this->fileReferenceFilesystem->createDirectory($dir));
        $this->assertTrue($this->fileReferenceFilesystem->exists($dir));
        $this->assertTrue($this->fileReferenceFilesystem->deleteDirectory($dir));
        $this->assertFalse($this->fileReferenceFilesystem->exists($dir));
    }

    public function testMoveFileOneShare()
    {
        $this->fileSystem->write($this->fileSystemDirectory . "/test.txt", "test");

        $fromFile = new ShareFileReference('test', 'test.txt', 4);
        $toFile   = new ShareFileReference('test', '/test/test.txt');

        $this->fileReferenceFilesystem->move($fromFile, $toFile);

        $this->assertFalse($this->fileReferenceFilesystem->exists($fromFile));
        $this->assertTrue($this->fileReferenceFilesystem->exists($toFile));
        $this->assertEquals("test", $this->fileReferenceFilesystem->getFileContent($toFile));
    }

    public function testMoveDirectory()
    {
        $this->fileSystem->write($this->fileSystemDirectory . "/test/test.txt", "test");

        $fromDirectory = new ShareFileReference('test', '/test');
        $toDirectory   = new ShareFileReference('test', '/test2');

        $this->fileReferenceFilesystem->move($fromDirectory, $toDirectory);

        $fromFile = new ShareFileReference('test', '/test/test.txt', 4);
        $toFile   = new ShareFileReference('test', '/test2/test.txt');

        $this->assertFalse($this->fileReferenceFilesystem->exists($fromFile));
        $this->assertTrue($this->fileReferenceFilesystem->exists($toFile));

        $this->assertEquals(
            "test",
            $this->fileReferenceFilesystem->getFileContent($toFile)
        );
    }

    public function testDeleteFile()
    {
        $this->fileSystem->write($this->fileSystemDirectory . "/test.txt", "test");

        $fileToDelete = new ShareFileReference('test', '/test.txt');

        $this->assertTrue($this->fileReferenceFilesystem->exists($fileToDelete));

        $this->fileReferenceFilesystem->delete($fileToDelete);

        $this->assertFalse($this->fileReferenceFilesystem->exists($fileToDelete));
    }

    public function testCopyFile()
    {
        $this->fileSystem->write($this->fileSystemDirectory . "/test.txt", "test");

        $fromFile = new ShareFileReference('test', '/test.txt');
        $toFile   = new ShareFileReference('test', '/test2.txt');

        $this->assertTrue($this->fileReferenceFilesystem->exists($fromFile));
        $this->assertFalse($this->fileReferenceFilesystem->exists($toFile));
        $this->assertTrue($this->fileReferenceFilesystem->copy($fromFile, $toFile));
        $this->assertTrue($this->fileReferenceFilesystem->exists($fromFile));
        $this->assertTrue($this->fileReferenceFilesystem->exists($toFile));
        $this->assertEquals(
            $this->fileReferenceFilesystem->getFileContent($fromFile),
            $this->fileReferenceFilesystem->getFileContent($toFile)
        );
    }

    public function testGetMimetype()
    {
        $this->fileSystem->write($this->fileSystemDirectory . "/test.txt", "test");

        $this->assertEquals(
            "text/plain",
            $this->fileReferenceFilesystem->getMimetype(new ShareFileReference('test', 'test.txt'))
        );
    }

    public function testGetFilesystemPath()
    {
        $this->fileSystem->write($this->fileSystemDirectory . "/test.txt", "test");

        $this->assertEquals(
            $this->fileSystemDirectory . "/test.txt",
            $this->fileReferenceFilesystem->getFilesystemPath(new ShareFileReference('test', 'test.txt'))
        );
    }

    public function testGetFileContentInvalidFile()
    {
        $this->setExpectedException(FileNotFoundException::class);
        $this->fileReferenceFilesystem->getFileContent(new ShareFileReference('test', 'test.txt'));
    }

    public function testListFilesEmpty()
    {
        $this->assertEquals(
            [],
            $this->fileReferenceFilesystem->listFiles(new ShareFileReference('test', ''))
        );
    }

    public function testListFilesWithFile()
    {
        $this->fileSystem->write($this->fileSystemDirectory . "/test.txt", "test");

        $this->assertEquals(
            [new ShareFileReference('test', 'test.txt', 4)],
            $this->fileReferenceFilesystem->listFiles(new ShareFileReference('test', '/'))
        );
    }

    public function testListFilesWithFilter()
    {
        $this->fileSystem->write($this->fileSystemDirectory . "/Errors/test.txt", "test");

        $this->assertEquals(
            [],
            $this->fileReferenceFilesystem->listFiles(
                new ShareFileReference('test', '/'),
                true,
                [
                    "/\/Errors\//",
                ]
            )
        );
    }

    public function testIsReadOnly()
    {
        $this->assertTrue($this->fileReferenceFilesystem->isReadOnly(new ShareFileReference('test', 'test.txt', 4)));
        $this->assertFalse($this->fileReferenceFilesystem->isReadOnly(new ShareFileReference('test2', 'test.txt', 4)));
    }

    public function testIsReadOnlyInvalidFileReference()
    {
        $fileReference = Phake::mock(FileReference::class);
        $this->setExpectedException(\InvalidArgumentException::class);
        $this->fileReferenceFilesystem->isReadOnly($fileReference);
    }

    public function testGetUserFilePath()
    {
        $this->assertEquals(
            "X:\\tmp\\test.txt",
            $this->fileReferenceFilesystem->getUserFilePath(new ShareFileReference('test', 'test.txt'))
        );
    }

    private function createTemporaryFileHandler()
    {
        $this->fileSystemDirectory = $this->createTemporaryDirectory();

        $adapter          = new Local("/");
        $this->fileSystem = new Filesystem($adapter);
        $this->fileSystem->addPlugin(new ListFiles());

        $this->shareRegistry = new ShareRegistry(
            [
                'test'  => [
                    'rootDirectory'     => $this->fileSystemDirectory,
                    'userRootDirectory' => 'X:\tmp',
                    'readOnly'          => 'true',
                ],
                'test2' => [
                    'rootDirectory'     => $this->fileSystemDirectory,
                    'userRootDirectory' => 'X:\tmp',
                    'readOnly'          => 'false',
                ],
            ]
        );

        $this->fileReferenceFilesystem = new FileReferenceFilesystem($this->fileSystem, $this->shareRegistry);
    }
}
