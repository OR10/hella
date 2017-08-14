<?php
use crosscan\Std;
use crosscan\Tests\Logger;

class cscntLoggerCouchDBWriterTests extends cscntLoggerCouchDBTestCase
{
    protected $writer = null;

    protected $group = null;

    public function setUp()
    {
        parent::setUp();

        $this->group = new Std\UUID();

        $this->writer = new cscntLogCouchDBWriter(
            $this->connection,
            $this->database
        );
        $this->writer->setGroup( $this->group->toDashlessString() );
    }

    protected function log( cscntLogWriter $writer, $type="String", $data = "Some message", $severity = cscntLogPayload::SEVERITY_INFO, $facility = "FooFacility", $id = "BarId" ) 
    {
        $method = "from" . $type;
        $writer->$method( $severity, $facility, $id, $data );
    }

    protected function fileStructFixture( $file = 'images/test.png', $mimeType = 'image/png' )
    {
        return new cscntLogFileStruct(
            $mimeType,
            file_get_contents( __DIR__ . '/' . $file )
        );
    }

    protected function fileDocumentFixture( $file = 'images/test.png', $mimeType = 'image/png' )
    {
        $struct = $this->fileStructFixture( $file, $mimeType );

        $document = array();

        $document['mimeType'] = $struct->mimeType;
        $document['filesize'] = $struct->filesize;

        return $document;
    }

    public function singlePayloadProvider()
    {
        $fixtureIterator = new \FilesystemIterator(
            __DIR__ . '/data/couchdb/fixture',
            \FilesystemIterator::KEY_AS_FILENAME |
                \FilesystemIterator::CURRENT_AS_PATHNAME |
                \FilesystemIterator::SKIP_DOTS
        );

        $expectedIterator = new \FilesystemIterator(
            __DIR__ . '/data/couchdb/expected',
            \FilesystemIterator::KEY_AS_FILENAME |
                \FilesystemIterator::CURRENT_AS_PATHNAME |
                \FilesystemIterator::SKIP_DOTS
        );

        $fixtures      = array();
        $types         = array();
        $expected      = array();
        $preprocessors = array();

        foreach( $fixtureIterator as $filename => $pathname )
        {
            $fixture             = require( $pathname );
            $fixtures[$filename] = $fixture['fixture'];
            $types[$filename]    = $fixture['type'];

            if ( isset( $fixture['preprocessor'] ) )
            {
                $preprocessors[$filename] = $fixture['preprocessor'];
            }
            else
            {
                $preprocessors[$filename] = function( phpillowResponse $document )
                {
                    return $document;
                };
            }
        }

        foreach( $expectedIterator as $filename => $pathname )
        {
            $expected[$filename] = json_decode(
                file_get_contents( $pathname ),
                true
            );
        }

        ksort( $fixtures );
        ksort( $types );
        ksort( $expected );

        $multiIterator = new Logger\MultipleIterator(
            Logger\MultipleIterator::MIT_NEED_ALL |
                Logger\MultipleIterator::MIT_KEYS_NUMERIC
        );

        $multiIterator->attachIterator(
            new \ArrayIterator( $types )
        );
        $multiIterator->attachIterator(
            new \ArrayIterator( $expected )
        );
        $multiIterator->attachIterator(
            new \ArrayIterator( $fixtures )
        );
        $multiIterator->attachIterator(
            new \ArrayIterator( $preprocessors )
        );

        return $multiIterator;
    }

    public function doublePayloadProvider()
    {
        $firstPayloads  = $this->singlePayloadProvider();
        $secondPayloads = $this->singlePayloadProvider();

        $result = array();
        foreach( $firstPayloads as $firstPayload )
        {
            foreach( $secondPayloads as $secondPayload )
            {
                $result[] = array_merge( $firstPayload, $secondPayload );
            }
        }

        return $result;
    }

    public function singlePayloadAttachmentsProvider()
    {
        $fixtureIterator = new \FilesystemIterator(
            __DIR__ . '/data/couchdb/fixture',
            \FilesystemIterator::KEY_AS_FILENAME |
                \FilesystemIterator::CURRENT_AS_PATHNAME |
                \FilesystemIterator::SKIP_DOTS
        );

        $attachmentsIterator = new \FilesystemIterator(
            __DIR__ . '/data/couchdb/attachments',
            \FilesystemIterator::KEY_AS_FILENAME |
                \FilesystemIterator::CURRENT_AS_PATHNAME |
                \FilesystemIterator::SKIP_DOTS
        );

        $fixtures    = array();
        $types       = array();
        $attachments = array();

        foreach( $attachmentsIterator as $filename => $pathname )
        {
            $attachments[$filename] = require( $pathname );
        }

        foreach( $fixtureIterator as $filename => $pathname )
        {
            // Skip all fixtures without an attachment
            if ( !isset( $attachments[$filename] ) )
            {
                continue;
            }

            $fixture             = require( $pathname );
            $fixtures[$filename] = $fixture['fixture'];
            $types[$filename]    = $fixture['type'];
        }


        ksort( $fixtures );
        ksort( $types );
        ksort( $attachments );

        $multiIterator = new Logger\MultipleIterator(
            Logger\MultipleIterator::MIT_NEED_ALL |
                Logger\MultipleIterator::MIT_KEYS_NUMERIC
        );

        $multiIterator->attachIterator(
            new \ArrayIterator( $types )
        );
        $multiIterator->attachIterator(
            new \ArrayIterator( $attachments )
        );
        $multiIterator->attachIterator(
            new \ArrayIterator( $fixtures )
        );

        return $multiIterator;
    }

    public function doublePayloadAttachmentsProvider()
    {
        $firstPayloads  = $this->singlePayloadAttachmentsProvider();
        $secondPayloads = $this->singlePayloadAttachmentsProvider();

        $result = array();
        foreach( $firstPayloads as $firstPayload )
        {
            foreach( $secondPayloads as $secondPayload )
            {
                $result[] = array_merge( $firstPayload, $secondPayload );
            }
        }

        return $result;
    }

    public function testGivenConnectionIsUsed() 
    {
        $connection = $this->getMockForAbstractClass( 
            'phpillowConnection',
            array( "foobar", 5984 )
        );

        $connection->expects( $this->once() )
            ->method( 'request' )
            ->will( 
                $this->throwException(  
                    new phpillowResponseErrorException( 
                        500, 
                        array( 
                            "error"  => "Internal TEST server error",
                            "reason" => "Test"
                        )
                    )
                )
            );

        $writer = new cscntLogCouchDBWriter( 
            $connection,
            "foobar"
        );
        $writer->setGroup(
            (new Std\UUID())->toDashlessString()
        );

        try
        {
            $this->log( $writer );
            $this->fail( "Expected Exception not thrown." );
        }
        catch( phpillowResponseErrorException $e )
        {
            $this->assertEquals(
                "Error (500) in request: Internal TEST server error (Test).",
                $e->getMessage()
            );
        }
    }

    public function testGivenDatabaseIsUsed() 
    {
        $connection = $this->getMockForAbstractClass( 
            'phpillowConnection',
            array( "foobar", 5984 )
        );

        $connection->expects( $this->once() )
            ->method( 'request' )
            ->with( 
                $this->anything(), 
                $this->stringStartsWith( '/Some-test-database-name-foobar/' ) 
            )
            ->will( 
                $this->throwException(  
                    new phpillowResponseErrorException( 
                        500, 
                        array( 
                            "error"  => "Internal TEST server error",
                            "reason" => "Test"
                        )
                    )
                )
            );

        $writer = new cscntLogCouchDBWriter( 
            $connection,
            "Some-test-database-name-foobar"
        );
        $writer->setGroup(
            (new Std\UUID())->toDashlessString()
        );

        try
        {
            $this->log( $writer );
            $this->fail( "Expected Exception not thrown." );
        }
        catch( phpillowResponseErrorException $e )
        {
            $this->assertEquals(
                "Error (500) in request: Internal TEST server error (Test).",
                $e->getMessage()
            );
        }
    }


    /**
     * @dataProvider singlePayloadProvider
     */
    public function testSinglePayloadLogged( $type, $expected, $fixture, $preprocessor )
    {
        $this->log(
            $this->writer,
            $type,
            $fixture
        );

        $allDocs = $this->getAllDocs();

        $this->assertEquals(
            1,
            $allDocs->total_rows
        );

        $document = $this->getDocument();

        $this->assertEquals(
            $expected,
            $preprocessor( $document )->payload
        );
    }

    /**
     * @dataProvider singlePayloadAttachmentsProvider
     */
    public function testSinglePayloadAttachmentsLogged( $type, $attachments, $fixture )
    {
        if ( count( $attachments ) ===  0 )
        {
            // This payload does not have an attachment
            return;
        }

        $this->log(
            $this->writer,
            $type,
            $fixture
        );

        $document = $this->getDocument();

        //inserting digest depending on couchdb version. If we have fully migrated to 1.2.0 this is obsolet and could be
        // moved to expected file.
        if ( $this->couchDbVersion >= self::COUCHDB_VERSION_1_1_1 )
        {
            foreach ( $attachments['json'] as $filename => $jsonData )
            {
                $attachments['json'][$filename]['digest'] = 'md5-' . base64_encode( hex2bin( md5( $attachments['files'][$filename] ) ) );
            }
        }

        $this->assertEquals(
            $attachments['json'],
            $document->_attachments
        );

        foreach( $attachments['files'] as $name => $attachmentData )
        {
            $this->assertEquals(
                $attachmentData,
                $this->getAttachment( $document->_id, $name )
            );
        }
    }

    /**
     * @dataProvider doublePayloadProvider
     */
    public function testDoublePayloadLogged( $firstType, $firstExpected, $firstFixture, $firstPreprocessor, $secondType, $secondExpected, $secondFixture, $secondPreprocessor )
    {
        $this->log(
            $this->writer,
            $firstType,
            $firstFixture
        );
        $this->log(
            $this->writer,
            $secondType,
            $secondFixture
        );

        $allDocs = $this->getAllDocs();

        $this->assertEquals(
            2,
            $allDocs->total_rows
        );

        $allDocuments = array(
            $this->getDocument( $allDocs->rows[0]['id'] ),
            $this->getDocument( $allDocs->rows[1]['id'] ),
        );

        $expectedPayloads = array(
            $firstExpected,
            $secondExpected,
        );

        foreach( $allDocuments as $actualDocument )
        {
            $expected = false;
            foreach( $expectedPayloads as $key => $expectedPayload )
            {
                if ( $actualDocument->payload == $expectedPayload )
                {
                    unset( $expectedPayloads[$key] );
                    $expected = true;
                    break;
                }
            }
            $this->assertTrue( $expected );
        }

        $this->assertCount( 0, $expectedPayloads );
    }

    /**
     * @dataProvider doublePayloadAttachmentsProvider
     */
    public function testDoublePayloadAttachmentLogged( $firstType, $firstAttachments, $firstFixture, $secondType, $secondAttachments, $secondFixture )
    {
        $this->log(
            $this->writer,
            $firstType,
            $firstFixture
        );
        $this->log(
            $this->writer,
            $secondType,
            $secondFixture
        );

        $allDocs = $this->getAllDocs();

        //inserting digest depending on couchdb version. If we have fully migrated to 1.2.0 this is obsolet and could be
        // moved to expected file.
        if ( $this->couchDbVersion >= self::COUCHDB_VERSION_1_1_1 )
        {
            foreach ( $firstAttachments['json'] as $filename => $jsonData )
            {
                $firstAttachments['json'][$filename]['digest'] = 'md5-' . base64_encode( hex2bin( md5( $firstAttachments['files'][$filename] ) ) );
            }
            foreach ( $secondAttachments['json'] as $filename => $jsonData )
            {
                $secondAttachments['json'][$filename]['digest'] = 'md5-' . base64_encode( hex2bin( md5( $secondAttachments['files'][$filename] ) ) );
            }
        }

        $allDocuments = array(
            $this->getDocument( $allDocs->rows[0]['id'] ),
            $this->getDocument( $allDocs->rows[1]['id'] ),
        );

        $expectedAttachments = array(
            $firstAttachments,
            $secondAttachments,
        );

        foreach( $allDocuments as $actualDocument )
        {
            $expected = false;
            foreach( $expectedAttachments as $key => $expectedAttachment )
            {
                if ( $actualDocument->_attachments == $expectedAttachment['json'] )
                {
                    foreach( $expectedAttachment['files'] as $name => $attachmentData )
                    {
                        if ( $attachmentData == $this->getAttachment( $actualDocument->_id, $name ) )
                        {
                            unset( $expectedAttachments[$key] );
                            $expected = true;
                            break;
                        }
                    }
                }
                if ( $expected === true )
                {
                    break;
                }
            }
            $this->assertTrue( $expected );
        }

        $this->assertCount( 0, $expectedAttachments );
    }

    public function testCurrentTimestampStored()
    {
        $this->log(
            $this->writer
        );
        $now = new DateTime();
        $nowTimestamp = $now->getTimestamp();

        $document = $this->getDocument();

        $this->assertTrue(
            $document->timestamp >= $nowTimestamp - 1
            && $document->timestamp <= $nowTimestamp + 1
        );
    }

    /**
     * @dataProvider singlePayloadProvider
     */
    public function testSeverityStored( $type, $expected, $fixture, $preprocessor )
    {
        $this->log(
            $this->writer,
            $type,
            $fixture
        );

        $document = $this->getDocument();

        $this->assertEquals(
            array(
                'numerical' => cscntLogPayload::SEVERITY_INFO,
                'textual' => "Info"
            ),
            $preprocessor( $document )->severity
        );
    }

    /**
     * @dataProvider singlePayloadProvider
     */
    public function testFacilityStored( $type, $expected, $fixture, $preprocessor )
    {
        $this->log(
            $this->writer,
            $type,
            $fixture
        );

        $document = $this->getDocument();

        $this->assertEquals(
            "FooFacility",
            $preprocessor( $document )->facility
        );
    }

    /**
     * @dataProvider singlePayloadProvider
     */
    public function testIdStored( $type, $expected, $fixture, $preprocessor )
    {
        $this->log(
            $this->writer,
            $type,
            $fixture
        );

        $document = $this->getDocument();

        $this->assertEquals(
            "BarId",
            $preprocessor( $document )->logId
        );
    }

    /**
     * @dataProvider singlePayloadProvider
     */
    public function testGroupStored( $type, $expected, $fixture, $preprocessor )
    {
        $this->log(
            $this->writer,
            $type,
            $fixture
        );

        $document = $this->getDocument();

        $this->assertEquals(
            (string)$this->group,
            $preprocessor( $document )->group
        );
    }

    /**
     * @dataProvider doublePayloadProvider
     */
    public function testSameGroupForMultiplePayloads( $firstType, $firstExpected, $firstFixture, $firstPreprocessor, $secondType, $secondExpected, $secondFixture, $secondPreprocessor )
    {
        $this->log(
            $this->writer,
            $firstType,
            $firstFixture
        );

        $this->log(
            $this->writer,
            $secondType,
            $secondFixture
        );

        $allDocs = $this->getAllDocs();
        $firstDocument  = $this->getDocument( $allDocs->rows[0]['id'] );
        $secondDocument = $this->getDocument( $allDocs->rows[1]['id'] );

        $this->assertEquals(
            (string)$this->group,
            $firstPreprocessor( $firstDocument )->group
        );

        $this->assertEquals(
            (string)$this->group,
            $secondPreprocessor( $secondDocument )->group
        );
    }

    /**
     * @dataProvider singlePayloadProvider
     */
    public function testDataTypeIsStored( $type, $expected, $fixture )
    {
        $this->log(
            $this->writer,
            $type,
            $fixture
        );

        $document = $this->getDocument();

        $this->assertEquals(
            $type,
            $document->consumedType
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
