<?php
class cscntLoggerWriterCollectionTests extends PHPUnit_Framework_TestCase
{
    protected $collection = null;

    public function setUp() 
    {
        $this->collection = new cscntLogWriterCollection();
    }

    /**
     * @expectedException cscntLogUniqueNameRequiredException
     */
    public function testDynamicArrayAccessProhibited() 
    {
        $this->collection[] = "foo";
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
