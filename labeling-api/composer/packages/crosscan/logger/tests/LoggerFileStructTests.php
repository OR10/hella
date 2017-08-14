<?php
class cscntLoggerFileStructTests extends PHPUnit_Framework_TestCase
{
    protected $file = null;

    public function setUp() 
    {
        $this->file = new cscntLogFileStruct(
            "image/png",
            file_get_contents(__DIR__ . '/images/test.png')
        );
    }

    public function directPropertiesProvider() 
    {
        return array( 
            array("mimeType", "image/png"),
            array("filesize", strlen(file_get_contents(__DIR__ . '/images/test.png'))),
            array("fileData", file_get_contents(__DIR__ . '/images/test.png')),
        );
    }

    /**
     * @dataProvider directPropertiesProvider
     */
    public function testDirectPropertyReadAccess( $property, $expected ) 
    {
        $this->assertEquals( 
            $expected,
            $this->file->$property
        );
    }

    /**
     * @dataProvider directPropertiesProvider
     * @expectedException cscntPropertyPermissionException
     */
    public function testDirectPropertyWriteAccessProhibited( $property, $expected ) 
    {
        $this->file->$property = "foo";
    }

    /**
     * @expectedException cscntPropertyNotFoundException
     */
    public function testInvalidPropertyReadAccessProhibited() 
    {
        $this->file->foobar;
    }

    /**
     * @expectedException cscntPropertyNotFoundException
     */
    public function testInvalidPropertyWriteAccessProhibited() 
    {
        $this->file->foobar = "baz";
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
