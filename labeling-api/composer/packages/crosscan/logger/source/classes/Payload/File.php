<?php
/**
 * Payload to transport file data through the logger subsystem.
 */
class cscntLogFilePayload extends cscntLogPayload implements cscntLogFileProducer, cscntLogHierarchicalArrayStructProducer
{
    /**
     * File data to be transported through the logger
     * subsystem
     *
     * @var cscntLogFileStruct
     */
    protected $file = null;

    /**
     * Construct an FilePayload taking the usual information like severity,
     * facililty and id, as well a file data object.
     *
     * @param int $severity
     * @param string $facility
     * @param string $id
     * @param cscntLogFileStruct $file
     * @return void
     */
    public function __construct( $severity, $facililty, $id, cscntLogFileStruct $file )
    {
        parent::__construct( $severity, $facililty, $id );

        $this->file = $file;
    }

    /**
     * Return the file data representation of this payload and return
     * it.
     *
     * @return cscntLogFileStruct
     */
    public function toFile()
    {
        return $this->file;
    }

    /**
     * Create a string representation of this log payload and return it.
     *
     * @return string
     */
    public function __toString()
    {
        return sprintf(
            "File of type '%s' with a filesize of %d bytes.",
            $this->file->mimeType,
            $this->file->filesize
        );
    }

    /**
     * Provide the priorities which are used to consume the provided types of
     * information.
     *
     * @return array( string )
     */
    public function getProducerPriority()
    {
        return array(
            'File',
            'HierarchicalArrayStruct',
            'String'
        );
    }

    /**
     * Creates a multidimensional array containing several key-value-pairs.
     *
     * @return array
     */
    public function toHierarchicalArrayStruct()
    {
        return array(
            'mimeType' => $this->file->mimeType,
            'filesize' => $this->file->filesize,
            'fileData' => $this->file->fileData,
        );
    }
}
