<?php
abstract class cscntLoggerFilesystemTestCase extends PHPUnit_Framework_TestCase
{
    protected $tempdir = null;

    public function setUp() 
    {
        // Create temporary directory for log output
        if ( ( $tmpfile = tempnam( sys_get_temp_dir(), "logger-test-" ) ) === false ) 
        {
            throw new Exception( "Could not create temporary working directory for unit test." );
        }

        unlink( $tmpfile );
        mkdir( $tmpfile );

        $this->tempdir = $tmpfile;
    }

    public function tearDown() 
    {
        // Delete the temporary directory and all of its contents
        if ( $this->tempdir === null ) 
        {
            return;
        }

        $tempDirIterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator( $this->tempdir, FilesystemIterator::SKIP_DOTS ) ,
            RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach( $tempDirIterator as $node ) 
        {
            switch( true ) 
            {
                case $node->isDir():
                    rmdir( $node->getPathname() );
                break;
                default:
                    unlink( $node->getPathname() );
            }
        }

        rmdir( $this->tempdir );
    }
}
