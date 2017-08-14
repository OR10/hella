<?php
class cscntLoggerOptionsTests extends PHPUnit_Framework_TestCase
{
    protected $logger = null;

    public function setUp() 
    {
        $this->options = new cscntLogOptions();
    }

    public function testWriterAvailable() 
    {
        $this->assertInstanceOf(
            "cscntLogWriterCollection",
            $this->options->writers
        );
    }

    public function testRoutesAvailable() 
    {
        $this->assertInstanceOf(
            "cscntLogRouteCollection",
            $this->options->routes
        );
    }

    /**
     * @expectedException \crosscan\Exception\PropertyPermission
     */
    public function testWritersReadOnly() 
    {
        $this->options->writers = null;
    }

    /**
     * @expectedException \crosscan\Exception\PropertyPermission
     */
    public function testRoutesReadOnly() 
    {
        $this->options->routes = null;
    }

    /**
     * @expectedException \crosscan\Exception\PropertyNotFound
     */
    public function testReadInvalidProperty() 
    {
        $this->options->foobar;
    }

    /**
     * @expectedException \crosscan\Exception\PropertyNotFound
     */
    public function testWriteInvalidProperty() 
    {
        $this->options->foobar = "baz";
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
