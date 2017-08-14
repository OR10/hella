<?php
class cscntLoggerFilePayloadTests extends PHPUnit_Framework_TestCase
{
    protected $payload = null;
    protected $file = null;
    protected $fileData = null;

    public function setUp() 
    {
        $this->fileData = file_get_contents( __DIR__ . '/images/test.svg' );

        $this->file = new cscntLogFileStruct(
            'application/svg+xml',
            $this->fileData
        );

        $this->payload = new cscntLogFilePayload(
            cscntLogPayload::SEVERITY_INFO,
            "FooFacility",
            "BarId",
            $this->file
        );
    }

    public function testStringProducer() 
    {
        $this->assertEquals( 
            "File of type 'application/svg+xml' with a filesize of 2111 bytes.",
            $this->payload->__toString()
        );
    }

    public function testFileProducer()
    {
        $this->assertSame( 
            $this->file,
            $this->payload->toFile()
        );
    }

    public function testHierarchicalArrayStructProducer()
    {
        $document = array(
            'mimeType' => "application/svg+xml",
            'filesize' => 2111,
            'fileData' => $this->file->fileData,
        );

        $this->assertEquals( 
            $document,
            $this->payload->toHierarchicalArrayStruct()
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
