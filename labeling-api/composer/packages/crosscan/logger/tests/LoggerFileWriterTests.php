<?php
class cscntLoggerFileWriterTests extends cscntLoggerFilesystemTestCase
{
    public function writerFixture( $target = "test.log" ) 
    {
        return new cscntLogFileWriter( 
            $this->tempdir . '/' . $target
        );
    }

    public function log( cscntLogWriter $writer, $message = "Some message", $severity = cscntLogPayload::SEVERITY_INFO, $facility = "FooFacility", $id = "BarId" ) 
    {
        $writer->fromString( $severity, $facility, $id, $message );
    }

    public function testLogFileCreation() 
    {
        $writer = $this->writerFixture( "test.log" );

        $this->assertFileExists( $this->tempdir . '/' . 'test.log' );
    }

    public function testExistingLogFileNotOverwritten() 
    {
        file_put_contents( $this->tempdir . '/foo.log', "Some\nContent\n" );
        
        $writer = $this->writerFixture( "foo.log");

        $this->assertEquals( 
            "Some\nContent\n",
            file_get_contents( $this->tempdir . '/foo.log' )
        );
    }

    public function testLogDataCorrectlyFormatted() 
    {
        $writer = $this->writerFixture();
        $this->log( $writer );

        $this->assertEquals( 
            1,
            preg_match( 
                '(^[A-Za-z]{3} [0-9]{2} ([0-9]{2}:){2}[0-9]{2} <Info> \[.*\] FooFacility: Some message' . "\n" . '$)D',
                file_get_contents( $this->tempdir . '/test.log' )
            )
        );
    }

    public function testLogDataAppended() 
    {
        $writer = $this->writerFixture();
        $this->log( $writer );

        $this->assertEquals( 
            1,
            preg_match( 
                '(^[A-Za-z]{3} [0-9]{2} ([0-9]{2}:){2}[0-9]{2} <Info> \[.*\] FooFacility: Some message' . "\n" . '$)D',
                file_get_contents( $this->tempdir . '/test.log' )
            )
        );
    }

    public function testLogDataFlushedASAP()
    {
        $writer = $this->writerFixture( 'foo.log' );
        $this->log( $writer );

        $this->assertEquals(
            1,
            preg_match_all(
                '([A-Za-z]{3} [0-9]{2} ([0-9]{2}:){2}[0-9]{2} <Info> \[.*\] FooFacility: Some message' . "\n" . ')D',
                file_get_contents( $this->tempdir . '/foo.log' ),
                $matches
            )
        );

        $this->log( $writer );

        $this->assertEquals(
            2,
            preg_match_all(
                '([A-Za-z]{3} [0-9]{2} ([0-9]{2}:){2}[0-9]{2} <Info> \[.*\] FooFacility: Some message' . "\n" . ')D',
                file_get_contents( $this->tempdir . '/foo.log' ),
                $matches
            )
        );
    }

    public function testExceptionOnAccessError() 
    {
        touch( $this->tempdir . '/foo.log' );
        chmod( $this->tempdir . '/foo.log', 0000 );

        try 
        {
            $writer = $this->writerFixture( "foo.log" );

            // Allow the file to be deleted again ;)
            chmod( $this->tempdir . '/foo.log', 0777 );

            $this->fail( "Expected ezcBaseFilePermissionException not thrown." );
        }
        catch( cscntPropertyPermissionException $e )
        {
            // Expected

            // Allow the file to be deleted again ;)
            chmod( $this->tempdir . '/foo.log', 0777 );
        }
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
