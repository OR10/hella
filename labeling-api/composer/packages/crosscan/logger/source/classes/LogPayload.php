<?php
/**
 * Abstract implementation of a data payload to be logged
 *
 * @property-read int $severity Severity level associated with this payload
 * @property-read string $facility Facility associated with this payload
 * @property-read string $id Id associated with this log message
 *
 */
abstract class cscntLogPayload implements cscntLogStringProducer
{
    /**
     * Severity levels returned by the <tt>getSeverity</tt> method.
     *
     * These levels indicate how big the impact of the given payload is.
     */
    const SEVERITY_DEBUG = 10;
    const SEVERITY_INFO = 20;
    const SEVERITY_WARNING = 30;
    const SEVERITY_ERROR = 40;
    const SEVERITY_FATAL = 50;

    /**
     * Internal storage for read-only properties which may be accessed and
     * provided using the default implementation.
     *
     * @var array
     */
    private $properties = array(
        'severity' => null,
        'facility' => null,
        'id'       => null
    );

    /**
     * Convert the numeric severity level into a textual representation
     *
     * @param int $severity
     * @return string
     */
    public static function getTextualSeverity( $severity )
    {
        switch( $severity )
        {
            case self::SEVERITY_DEBUG:
                return "Debug";
            case self::SEVERITY_INFO:
                return "Info";
            case self::SEVERITY_WARNING:
                return "Warning";
            case self::SEVERITY_ERROR:
                return "Error";
            case self::SEVERITY_FATAL:
                return "Fatal";
            default:
                throw new RuntimeException( "Unknown severity level" );
        }
    }

    /**
     * Construct a new cscntLogPayload object taking severity and facility as
     * arguments.
     *
     * The given arguments will be stored and later on retrieved, if the
     * default implementation of the <tt>getSeverity</tt> or
     * <tt>getFacility</tt> methods is called.
     *
     * If these methods have been overridden a call to this base constructor is
     * not neccessary.
     *
     * @param int $severity
     * @param string $facility
     * @param string $id
     */
    public function __construct( $severity, $facility, $id )
    {
        $this->properties['severity'] = $severity;
        $this->properties['facility'] = $facility;
        $this->properties['id'] = $id;
    }

    /**
     * Retrieve the read-only properties based on the internal retrieval
     * functions
     *
     * @throws \crosscan\Exception\PropertyNotFound if an invalid property has been
     * requested.
     *
     * @param string $key
     * @return mixed
     */
    public function __get( $key )
    {
        if ( array_key_exists( $key, $this->properties ) !== true )
        {
            throw new \crosscan\Exception\PropertyNotFound( $key );
        }

        switch( $key )
        {
            case "severity":
                return $this->getSeverity();
            case "facility":
                return $this->getFacility();
            case "id":
                return $this->getId();
        }
    }

    /**
     * Set properties
     *
     * As there are only read only properties an exception upon calling of this
     * function is thrown.
     *
     * @throws \crosscan\Exception\PropertyNotFound if the requested property does
     * not exist
     * @throws \crosscan\Exception\PropertyPermission exception if a write to one of the
     * readonly properties is requested
     *
     * @param mixed $key
     * @param mixed $value
     * @return void
     */
    public function __set( $key, $value )
    {
        if ( array_key_exists( $key, $this->properties ) !== true )
        {
            throw new \crosscan\Exception\PropertyNotFound( $key );
        }

        throw new \crosscan\Exception\PropertyPermission(
            $key,
            \crosscan\Exception\PropertyPermission::READ
        );
    }

    /**
     * Return a severity level for the transported payload.
     *
     * Severities are defined as class constants of
     * <tt>cscntLogPayload</tt>:
     *
     * <code>
     *   cscntLogPayload::SEVERITY_INFO
     *   cscntLogPayload::SEVERITY_WARNING
     *   cscntLogPayload::SEVERITY_FATAL
     *   …
     * </code>
     *
     * @return int
     */
    protected function getSeverity()
    {
        return $this->properties['severity'];
    }

    /**
     * Return a facility which produced this payload.
     *
     * Facilities are the source a certain information is produced at.
     *
     * Even though facilities are simple strings, which might be provided
     * directly at their source. It is sugested to only use facillities defined
     * as constants to the <tt>cscntFacility</tt> class.
     *
     * @return string
     */
    protected function getFacility()
    {
        return $this->properties['facility'];
    }

    /**
     * Return the id of this payload
     *
     * Payload implementations are encouraged, but not forced to provide an
     * id. This id can be used by writers later on to store the provided
     * payload using a meaningful name.
     *
     * It is acceptable for a payload implementation to return null here.
     *
     * @return string
     */
    protected function getId()
    {
        return $this->properties['id'];
    }

    /**
     * Return an array of supported producer interfaces in the order they
     * should be used, if accepted by the targetted
     * <tt>cscntLogWriter</tt>.
     *
     * The interfaces are not identified by their full name, but only by
     * their datatype part <tt>cscntLogDATATYPEProducer</tt>. Example
     * <tt>String</tt>, <tt>Image</tt>, <tt>Request</tt>, …
     *
     * Producer interfaces listed first are considered to be of a higher
     * priority, than interfaces listed last.
     *
     * The <tt>cscntLogStringProducer</tt> interface (String) is added
     * automatically as the last entry in the array if not already given
     * there.
     *
     * <code>
     *   array(
     *     'Image',
     *     'Base64',
     *     …
     *   )
     * </code>
     */
    public function getProducerPriority()
    {
        return array();
    }
}
