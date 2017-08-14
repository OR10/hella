<?php
/**
 * Struct holding all the necessary information about a logged file
 *
 * This information includes metadata, as well as the binary data of the logged
 * file itself.
 *
 * @property-read string $mimeType Mimetype of the represented file. Example:
 * image/png, image/jpeg, image/svg+xml, application/xml, etc.
 *
 * @property-read int $filesize Filsize of the stored file in bytes
 *
 * @property-read string $fileData The raw file data stored for this file. In
 * most cases this information will be binary data. For some file types, like
 * image/svg+xml, application/xml, etc. it is a human readable string.
 */
class cscntLogFileStruct /*TODO: extend from cscntStruct, after it has been cleanedup in the future */
{
    /**
     * Internal storage for read-only properties
     *
     * @var array
     */
    protected $properties = array(
        "mimeType" => null,
        "filesize" => null,
        "fileData" => null,
    );

    /**
     * Construct a new file struct based on a mimetype and raw file data
     * matching that mimetype.
     *
     * @param string $mimeType
     * @param string $fileData
     */
    public function __construct($mimeType, $fileData)
    {
        $this->properties["mimeType"] = $mimeType;
        $this->properties["fileData"] = $fileData;
        $this->properties["filesize"] = strlen($fileData);
    }

    /**
     * Return read-only properties and pass through access to metadata
     * properties.
     *
     * @throws cscntPropertyNotFoundException if the requested property is
     * invalid
     *
     * @param string $key
     * @return mixed
     */
    public function __get($key)
    {
        if (array_key_exists($key, $this->properties) === true)
        {
            return $this->properties[$key];
        }

        throw new cscntPropertyNotFoundException($key);
    }

    /**
     * Set writable properties
     *
     * @throws cscntPropertyNotFoundException if the provided property does
     * not exist.
     * @throws cscntPropertyPermissionException if the provided property does
     * exist, but is a read-only property
     *
     * @param string $key
     * @param mixed $value
     * @return void
     */
    public function __set($key, $value)
    {
        if (array_key_exists($key, $this->properties) === true)
        {
            throw new cscntPropertyPermissionException(
                $key,
                cscntPropertyPermissionException::READ
            );
        }

        throw new cscntPropertyNotFoundException($key);
    }
}
