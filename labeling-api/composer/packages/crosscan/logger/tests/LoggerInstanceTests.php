<?php
class cscntLoggerInstanceTests extends PHPUnit_Framework_TestCase
{
    protected $logger = null;

    public function setUp() 
    {
        $this->logger = new cscntNoopLogger();

        // We are calling this function here in good faith, that it works as 
        // expected. A dedicated test for this function exists however as well.
        cscntLoggerInstance::reset();
    }

    public function testEmptyInstanceGet() 
    {
        try 
        {
            cscntLoggerInstance::get();
            $this->fail( "Expected cscntLoggerInstanceNotAvailableException not thrown." );
        }
        catch ( cscntLoggerInstanceNotAvailableException $e )
        {
            // Expected
        }
    }

    public function testInstanceSet() 
    {
        cscntLoggerInstance::set( $this->logger );
    }

    public function testInstanceRetrieval() 
    {
        cscntLoggerInstance::set( $this->logger );
        $this->assertSame( 
            $this->logger,
            cscntLoggerInstance::get()
        );
    }

    public function testInstanceReset() 
    {
        cscntLoggerInstance::set( $this->logger );
        cscntLoggerInstance::reset();
        try 
        {
            cscntLoggerInstance::get();
            $this->fail( 
                "Expected cscntLoggerInstanceNotAvailableException not thrown. Reset did not clear the LoggerInstance cache." 
            );
        }
        catch ( cscntLoggerInstanceNotAvailableException $e )
        {
            // Expected
        }
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
