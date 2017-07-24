<?php

namespace AnnoStationBundle\Tests\Service\Video;

use AnnoStationBundle\Service\Video\MetaDataReader;

class MetaDataReaderMock extends MetaDataReader
{
    public $lastRunCommand = null;

    public $runCommandStubbedResult = "";

    protected function runCommand(string $commandline): string
    {
        $this->lastRunCommand = $commandline;

        return $this->runCommandStubbedResult;
    }
}

class MetaDataReaderTest extends \PHPUnit_Framework_TestCase
{
    private $metaDataReader;

    public function provideCommandOutput()
    {
        $fixtures = [
            ['avi-video-output.json', 'avi-video-result.php'],
            ['mp4-video-output.json', 'mp4-video-result.php'],
            ['jpg-image-output.json', 'jpg-image-result.php'],
            ['png-image-output.json', 'png-image-result.php'],
        ];

        $data = [];

        foreach ($fixtures as $outputAndResult) {
            $data[] = [
                file_get_contents(__DIR__ . "/MetaDataReaderFixtures/{$outputAndResult[0]}"),
                include(__DIR__ . "/MetaDataReaderFixtures/{$outputAndResult[1]}"),
            ];
        }

        return $data;
    }

    private function createMetaDataReader($ffprobeExecutable = 'avprobe')
    {
        return new MetaDataReaderMock($ffprobeExecutable);
    }

    public function testIsInstantiable()
    {
        $reader = $this->createMetaDataReader();
        $this->assertInstanceOf(MetaDataReader::class, $reader);
    }

    /**
     * @dataProvider provideCommandOutput
     */
    public function testCallsWithCorrectCommandline($ffprobeOutput)
    {
        $reader = $this->createMetaDataReader('avprobe');
        $reader->runCommandStubbedResult = $ffprobeOutput;

        $filename = __DIR__ . "/MetaDataReaderFixtures/size-fixture.zero";

        $reader->readMetaData($filename);

        $expectedCommandLine = 'avprobe -show_format -show_streams -of json -v quiet "' . $filename . '"';
        $this->assertEquals($expectedCommandLine, $reader->lastRunCommand);
    }

    /**
     * @dataProvider provideCommandOutput
     */
    public function testMetadataIsExtractedCorrectly($ffprobeOutput, $expectedMetadata)
    {
        $reader = $this->createMetaDataReader('avprobe');
        $reader->runCommandStubbedResult = $ffprobeOutput;

        $filename = __DIR__ . "/MetaDataReaderFixtures/size-fixture.zero";

        $actualMetadata = $reader->readMetaData($filename);

        $this->assertEquals($expectedMetadata, $actualMetadata);
    }
}
