<?php
/**
 * phpillowDocument implementation used to store the information of one log
 * cycle including all associated payloads inside the CouchDB
 */
class cscntLogCouchDBWriterDocument extends phpillowDocument
{
    /**
     * Document type used for storage and type checking.
     */
    protected static $type = 'log';

    /**
     * Construct a new Document of this type
     *
     * @return void
     */
    public function __construct()
    {
        $this->properties = array(
            'group'        => new phpillowUuidValidator(),
            'timestamp'    => new phpillowIntegerValidator(),
            'severity'     => new phpillowNoValidator(),
            'facility'     => new phpillowStringValidator(),
            'logId'        => new phpillowStringValidator(),
            'consumedType' => new phpillowStringValidator(),
            'payload'      => new phpillowNoValidator(),
        );

        parent::__construct();
    }

    /**
     * Generate a document id for this log entry.
     *
     * @return string
     */
    protected function generateId()
    {
        // Microtime instead of time is used in order to minimize collisions,
        // due to multiple log documents inside the same time frame
        //
        // The type will be automatically be prepended by the phpillow base
        // implementation.
        return null;
    }

    /**
     * Return the type identifier of this document
     *
     * @return string
     */
    protected function getType()
    {
        return static::$type;
    }
}
