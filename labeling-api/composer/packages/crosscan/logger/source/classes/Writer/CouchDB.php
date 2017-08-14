<?php
use crosscan\Std;

/**
 * Log writer utilizing Apache CouchDB as a data store.
 */
class cscntLogCouchDBWriter extends cscntLogWriter
    implements cscntLogHierarchicalArrayStructConsumer, cscntLogFileConsumer
{
    /**
     * phpillowConnection used to communicate with the CouchDB as a data store.
     *
     * @var phpillowConnection
     */
    protected $connection = null;

    /**
     * Databasename to be used for storing log information
     *
     * @var string
     */
    protected $database = null;

    /**
     * Group used for logging
     *
     * @var string
     */
    protected $group = null;

    /**
     * Construct a new CouchDB writer, which uses the given phpillowConnection
     * and database name to store the logged information.
     *
     * @param phpillowConnection $connection
     * @param string $database
     */
    public function __construct( phpillowConnection $connection, $database )
    {
        $this->connection = $connection;
        $this->database = $database;
    }

    public function setGroup( $uuid )
    {
        $this->group = $uuid;
    }

    /**
     * Log a payload based on its string representation.
     *
     * This consumer will only be used if no JSON representation is available.
     * JSON is the prefered consumer format of the CouchDB writer.
     *
     * @param int $severity
     * @param string $facility
     * @param string|null $id
     * @param string $string
     * @return void
     */
    public function fromString( $severity, $facility, $id, $string )
    {
        $document = $this->createDocument( $severity, $facility, $id, 'String' );
        $document->payload = $string;
        $document->save();
    }

    /**
     * Write a payload based on its hierarchical array struct representation
     *
     * @param int $severity
     * @param string $facility
     * @param string $id
     * @param array $payload
     * @return void
     */
    public function fromHierarchicalArrayStruct( $severity, $facility, $id, array $payload )
    {
        $document = $this->createDocument( $severity, $facility, $id, 'HierarchicalArrayStruct' );

        if ( isset( $payload['_attachments'] ) )
        {
            foreach( $payload['_attachments'] as $attachment )
            {
                $name = $this->getFreeAttachmentName(
                    $document,
                    $id === null ? 'attachment' : $id
                );

                $document->attachMemoryFile(
                    $attachment['data'],
                    $attachment['name'],
                    $attachment['mimeType']
                );
            }

            unset( $payload['_attachments'] );
        }

        $document->payload = $payload;
        $document->save();
    }

    /**
     * Write a file payload to the database
     *
     * Files are stored as attachment to the document, therefore their payload
     * needs special handling.
     *
     * @param int $severity
     * @param string $facility
     * @param string|null $id
     * @param cscntLogFileStruct $file
     * @return void
     */
    public function fromFile( $severity, $facility, $id, cscntLogFileStruct $file )
    {
        $document = $this->createDocument( $severity, $facility, $id, 'File' );

        $payload = new StdClass;
        $payload->filesize = $file->filesize;
        $payload->mimeType = $file->mimeType;

        $name = $this->getFreeAttachmentName(
            $document,
            $id === null ? 'file' : $id
        );

        $document->attachMemoryFile(
            $file->fileData,
            $name,
            $file->mimeType
        );
        $document->payload = $payload;
        $document->save();
    }

    /**
     * Get a free attachment name based on the one given.
     *
     * If the given name has already been taken a dot folowed by a number will
     * be be appended. This number will be incremented until a free attachment
     * slot is found.
     *
     * @param cscntLogCouchDBWriterDocument $document
     * @param string $id
     * @return string
     */
    protected function getFreeAttachmentName( cscntLogCouchDBWriterDocument $document, $id )
    {
        $toCheck = $id;
        $i = 0;

        while( array_key_exists( $toCheck, $document->_attachments ) === true )
        {
            $toCheck = $id . '.' . ++$i;
        }

        return $toCheck;
    }

    /**
     * Create and return a phpillowDocument used to store a payload
     *
     * The data type is stored alongside the payload inside the document to
     * ease reconstruction and filtering of log data, while processing the
     * information later on. Unfortunately the real payload type can't be
     * extracted at this point anymore, but at least the used Consumer
     * interface provides some sort of data
     *
     * @param int $severity
     * @param string $facility
     * @param string $id
     * @param string $consumedType
     * @return cscntLogCouchDBWriterDocument
     */
    protected function createDocument( $severity, $facility, $id, $consumedType )
    {
        $document = new cscntLogCouchDBWriterDocument();
        $document->setConnection( $this->connection );
        $document->setDatabase( $this->database );

        $document->group = (string)$this->group;

        $now = new \DateTime("now");
        $document->timestamp = $now->getTimestamp();

        $severityDocument = new StdClass();
        $severityDocument->numerical = $severity;
        $severityDocument->textual   = cscntLogPayload::getTextualSeverity( $severity );
        $document->severity = $severityDocument;

        $document->facility = $facility;
        $document->logId = $id;

        $document->consumedType = $consumedType;

        return $document;
    }
}
