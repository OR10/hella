<?php
class cscntLoggerCouchDBTestCase extends PHPUnit_Framework_TestCase
{
    protected $connection = null;
    protected $database = null;
    protected $couchDbVersion;

    const COUCHDB_VERSION_0_10_0  = 1;
    const COUCHDB_VERSION_1_1_1   = 20;
    const COUCHDB_VERSION_1_2_0   = 30;
    const COUCHDB_VERSION_1_5_0   = 40;
    const COUCHDB_VERSION_UNKNOWN = 50;

    public function setUp() 
    {
        $connection = new phpillowCustomConnection( 
            'localhost',
            5984
        );

        try 
        {
            // Check if the couchdb is listening and ready
            $response = $connection->get( "/" );

            if ( $response->couchdb != "Welcome" ) 
            {
                $this->markTestSkipped( 'Something else than the CouchDB is listening to port 5984' );
                return;
            }

            $this->couchDbVersion = $this->determineVersion($response->version);
        }
        catch( Exception $e ) 
        {
            $this->markTestSkipped( 'No running CouchDB found.' );
            return;
        }

        $this->connection = $connection;

        if ( $this->couchDbVersion == self::COUCHDB_VERSION_1_1_1 )
        {
            $connection->setOption( 'keep-alive', false );
        }

        $this->database = $this->createFreeDatabase( 'test' );
        $this->connection->put( "/" . $this->database );
    }

    public function tearDown() 
    {
        if ( $this->connection !== null )
        {
            $this->connection->delete( "/" . $this->database );
        }
    }

    protected function createFreeDatabase( $prefix = "" ) 
    {
        while( true ) 
        {
            $name = $prefix . '-'
            . sha1( 
                mt_rand() . mt_rand() . mt_rand()
            );

            try 
            {
                $this->connection->get( "/" . $name );
            }
            catch( phpillowResponseNotFoundErrorException $e ) 
            {
                // We are using an exception for control flow here. Even though 
                // this is evil there is no other way to do this with phpillow at 
                // the moment :(

                // The db name is free use it
                return $name;
            }
        }
    }

    protected function determineVersion( $version )
    {
        switch($version)
        {
            case '0.10.0':
                return $this->couchDbVersion = self::COUCHDB_VERSION_0_10_0;
            case '1.1.1':
                return $this->couchDbVersion = self::COUCHDB_VERSION_1_1_1;
            case '1.2.0':
                return $this->couchDbVersion = self::COUCHDB_VERSION_1_2_0;
            case '1.5.0':
                return $this->couchDbVersion = self::COUCHDB_VERSION_1_5_0;
            default:
                return $this->couchDbVersion = self::COUCHDB_VERSION_UNKNOWN;
        }
    }

    protected function getAllDocs() 
    {
        return $this->connection->get( 
            "/" . $this->database . '/_all_docs'
        );
    }

    protected function getDocument( $id = null ) 
    {
        if ( $id !== null ) 
        {
            return $this->connection->get(
                "/" . $this->database . '/' . $id
            );
        }

        $allDocs = $this->getAllDocs();
        if ( $allDocs->total_rows != 1 ) 
        {
            return null;
        }

        return $this->getDocument(
            $allDocs->rows[0]['id']
        );
    }

    protected function getAttachment( $documentId, $name )
    {
        $attachment = $this->connection->get(
            '/' . $this->database . '/' . $documentId . '/' . $name,
            null,
            true
        );

        return $attachment->data;
    }
}
