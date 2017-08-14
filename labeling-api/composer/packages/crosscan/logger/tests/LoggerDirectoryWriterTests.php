<?php
use crosscan\Std;

class cscntLoggerDirectoryWriterTests extends cscntLoggerFilesystemTestCase
{
    private $uuid = "someUuid";

    protected function writerFixture($target = "test-dir")
    {
        $writer = new cscntLogDirectoryWriter(
            $this->tempdir . '/' . $target
        );

        $writer->setGroup($this->uuid);

        return $writer;
    }

    protected function log(
        cscntLogWriter $writer,
        $type = "String",
        $data = "Some message",
        $severity = cscntLogPayload::SEVERITY_INFO,
        $facility = "FooFacility",
        $id = "BarId"
    ) {
        $method = "from" . $type;
        $writer->$method($severity, $facility, $id, $data);
    }

    protected function getCreatedWriterDirectory($directory = "test-dir")
    {
        $fulldir = $this->tempdir . '/' . $directory;
        $dirs    = glob($fulldir . '/*', GLOB_ONLYDIR);
        return reset($dirs);
    }

    public function formatProvider()
    {
        $formats = array(
            'File',
            'HierarchicalArrayStruct',
        );

        $result = array();

        foreach ($formats as $format) {
            $results[] = array(
                $format,
                __DIR__ . '/data/produced_' . strtolower($format) . '.php',
                __DIR__ . '/data/produced_' . strtolower($format) . '.raw',
            );
        }

        return $results;
    }

    public function testLogDirectoryCreation()
    {
        $writer = $this->writerFixture();

        $this->assertFileExists($this->tempdir . '/' . 'test-dir');
        $this->assertTrue(is_dir($this->tempdir . '/' . 'test-dir'));
    }

    public function testExistingLogDirNotOverwritten()
    {
        mkdir($this->tempdir . '/foo');
        touch($this->tempdir . '/foo/bar');

        $writer = $this->writerFixture("foo");

        $this->assertFileExists(
            $this->tempdir . '/foo/bar'
        );
    }

    /**
     * @expectedException cscntPropertyPermissionException
     */
    public function testExceptionOnDirectoryExistsAndIsAFile()
    {
        touch($this->tempdir . '/foo');

        $writer = $this->writerFixture("foo");
    }

    /**
     * @expectedException cscntPropertyPermissionException
     */
    public function testExceptionOnDirectoryExistsAndIsALink()
    {
        symlink("bar", $this->tempdir . '/foo');

        $writer = $this->writerFixture("foo");
    }

    public function testExceptionOnDirectoryExistsAndIsNotWritable()
    {
        mkdir($this->tempdir . '/foo');

        chmod($this->tempdir . '/foo', 0000);

        try {
            $writer = $this->writerFixture("foo");

            // Allow the file to be deleted again ;)
            chmod($this->tempdir . '/foo', 0777);

            $this->fail("Expected cscntPropertyPermissionException not thrown.");
        } catch (cscntPropertyPermissionException $e) {
            // Expected

            // Allow the file to be deleted again ;)
            chmod($this->tempdir . '/foo', 0777);
        }
    }

    public function testStringDataWrittenToFile()
    {
        // The written format is not checked here, as internally an FileWriter 
        // is used for that, which has it's own unit tests. Unfortunately we 
        // can not check if this writer is really used. Therefore we have to 
        // act in good faith.

        $writer = $this->writerFixture();
        $this->log($writer);

        $directory = $this->getCreatedWriterDirectory();

        $this->assertEquals(
            1,
            preg_match(
                '(Some message)',
                file_get_contents($directory . '/messages.log')
            )
        );
    }

    public function testMultipleStringDataLoggedToOneFile()
    {
        $writer = $this->writerFixture();

        $this->log($writer);
        $this->log($writer);

        $directory = $this->getCreatedWriterDirectory();

        $this->assertEquals(
            2,
            preg_match_all(
                '(Some message)',
                file_get_contents($directory . '/messages.log'),
                $matches
            )
        );
    }

    public function testCreatedCycleDirectoryHasCorrectNamingScheme()
    {
        $writer = $this->writerFixture();

        $this->assertRegExp(
            '(^[A-Z][a-z]{2}-[0-9]{2}-([0-9]{2}\.){2}[0-9]{2}-' . $this->uuid . '$)',
            basename($this->getCreatedWriterDirectory())

        );
    }

    public function testOneDirectoryIsCreatedForEachCycle()
    {
        $writer = $this->writerFixture();
        $writer->setGroup(
            new Std\UUID()
        );

        $this->assertEquals(
            2,
            count(
                glob($this->tempdir . '/test-dir/*', GLOB_ONLYDIR)
            )
        );
    }

    /**
     * @dataProvider formatProvider
     */
    public function testSpecialFormatsWrittenToFileWithoutId($format, $file, $expectedDataFile)
    {
        $writer = $this->writerFixture();
        $data   = require($file);
        $this->log($writer, $format, $data, cscntLogPayload::SEVERITY_INFO, "FooFacility", null);

        $directory = $this->getCreatedWriterDirectory();

        switch ($format) {
            case 'File':
                $expectedFile = "file.raw";
                break;
            case 'HierarchicalArrayStruct':
                $expectedFile = "document.json";
                break;
        }

        $this->assertFileExists(
            $directory . '/' . $expectedFile
        );

        $this->assertFileEquals(
            $expectedDataFile,
            $directory . '/' . $expectedFile
        );
    }

    /**
     * @dataProvider formatProvider
     */
    public function testSpecialFormatsWrittenToFileWithId($format, $file, $expectedDataFile)
    {
        $writer = $this->writerFixture();
        $data   = require($file);
        $this->log($writer, $format, $data);

        $directory = $this->getCreatedWriterDirectory();

        switch ($format) {
            case 'File':
                $expectedFile = "BarId.raw";
                break;
            case 'HierarchicalArrayStruct':
                $expectedFile = "BarId.json";
                break;
        }

        $this->assertFileExists(
            $directory . '/' . $expectedFile
        );

        $this->assertFileEquals(
            $expectedDataFile,
            $directory . '/' . $expectedFile
        );
    }

    /**
     * @dataProvider formatProvider
     */
    public function testSpecialFormatsWrittenToFileWithoutIdMultiple($format, $file, $expectedDataFile)
    {
        $writer = $this->writerFixture();
        $data   = require($file);
        $this->log($writer, $format, $data, cscntLogPayload::SEVERITY_INFO, "FooFacility", null);
        $this->log($writer, $format, $data, cscntLogPayload::SEVERITY_INFO, "FooFacility", null);

        $directory = $this->getCreatedWriterDirectory();

        switch ($format) {
            case 'File':
                $name      = "file";
                $extension = ".raw";
                break;
            case 'HierarchicalArrayStruct':
                $name      = "document";
                $extension = ".json";
                break;
        }

        $this->assertFileExists(
            $directory . '/' . $name . $extension
        );

        $this->assertFileExists(
            $directory . '/' . $name . '.1' . $extension
        );

        $this->assertFileEquals(
            $expectedDataFile,
            $directory . '/' . $name . $extension
        );

        $this->assertFileEquals(
            $expectedDataFile,
            $directory . '/' . $name . '.1' . $extension
        );
    }

    /**
     * @dataProvider formatProvider
     */
    public function testSpecialFormatsWrittenToFileWithIdMultiple($format, $file, $expectedDataFile)
    {
        $writer = $this->writerFixture();
        $data   = require($file);
        $this->log($writer, $format, $data);
        $this->log($writer, $format, $data);

        $directory = $this->getCreatedWriterDirectory();

        $name = "BarId";
        switch ($format) {
            case 'File':
                $extension = ".raw";
                break;
            case 'HierarchicalArrayStruct':
                $extension = ".json";
                break;
        }

        $this->assertFileExists(
            $directory . '/' . $name . $extension
        );

        $this->assertFileExists(
            $directory . '/' . $name . '.1' . $extension
        );

        $this->assertFileEquals(
            $expectedDataFile,
            $directory . '/' . $name . $extension
        );

        $this->assertFileEquals(
            $expectedDataFile,
            $directory . '/' . $name . '.1' . $extension
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite(__CLASS__);
    }
}
