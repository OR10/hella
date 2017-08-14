<?php

use crosscan\Std\UUID;
use crosscan\Logger\Payload;

/**
 * Logger base class
 *
 * @property-read cscntLogOptions $options Configuration options of the logger
 */
class cscntLogger
{
    /**
     * Indicating if the logger is in debug mode or not
     *
     * @var boolean
     */
    private $debugEnabled;

    /**
     * Read-only properties of this logger
     *
     * @var array
     */
    protected $properties = array(
        "options" => null
    );

    /**
     * Group (UUID) used while outputting data to the writers
     *
     * A group will automatically be initialized during initial creation of the
     * logger. It will be reused as long as new one is enforced with `newGroup`.
     *
     * As a group is usually supposed to combine log methods of one
     * request/action the default behaviour of keeping the group for the fully
     * period is most likely what you want.
     *
     * @var UUID
     */
    protected $group;

    /**
     * Create a new Logger optionally taking a special LogOptions
     * implementation as argument
     *
     * @param cscntLogOptions $options
     * @param bool $debugEnabled
     */
    public function __construct( cscntLogOptions $options = null, $debugEnabled = false )
    {
        if ( $options === null )
        {
            $options = new cscntLogOptions();
        }

        $this->properties["options"] = $options;
        $this->debugEnabled          = $debugEnabled;

        $this->newGroup();
    }

    /**
     * Create a new group and active it.
     *
     * This method will automatically be called once during initialization of
     * the Logger instance.
     *
     * A group identifies the correlation of logged payloads to each other. As
     * you usally want to group all payloads of one request, the default
     * behaviour is most likely what you want. You may never need to call this
     * method on your own.
     *
     * @return void
     */
    public function newGroup()
    {
        $this->group = new UUID();
    }

    /**
     * UUID to identify "the current request" (at least in most cases)
     *
     * See the documentation of the property for details
     *
     * @return string
     */
    public function getGroup()
    {
        return $this->group->toDashlessString();
    }

    /**
     * Access read-only properties
     *
     * @throws \crosscan\Exception\PropertyNotFound if the given property is
     * invalid
     *
     * @param mixed $key
     * @return mixed
     */
    public function __get( $key )
    {
        if ( array_key_exists( $key, $this->properties ) === false )
        {
            throw new \crosscan\Exception\PropertyNotFound( $key );
        }

        return $this->properties[$key];
    }

    /**
     * Set properties. Throw exception if read-only property is accessed
     *
     * @throws \crosscan\Exception\PropertyNotFound if an invalid property is
     * requested
     * @throws \crosscan\Exception\PropertyPermission if a read-only property is
     * accessed
     *
     * @param mixed $key
     * @param mixed $value
     * @return void
     */
    public function __set( $key, $value )
    {
        if ( array_key_exists( $key, $this->properties ) === false )
        {
            throw new \crosscan\Exception\PropertyNotFound( $key );
        }

        throw new \crosscan\Exception\PropertyPermission(
            $key,
            \crosscan\Exception\PropertyPermission::READ
        );
    }

    /**
     * Accept any LogPayload and delegate it to the appropriate routes/writers
     * from here
     *
     * @param cscntLogPayload $payload
     * @return void
     */
    public function log( cscntLogPayload $payload )
    {
        try
        {
            $payloadsToWrite = $this->routePayload( $payload );
            $this->sendPayloadsToWriterIds( $payloadsToWrite );
        }
        catch( \Exception $e )
        {
            // Ignore all errorstates for now, to not disturb program execution
            // in case of a log error
            // @TODO: Logging errors should be logged somewhere
            if($this->debugEnabled) {
                var_dump($e);
            }
            return;
        }
    }

    /**
     * Route a certain payload through each route and return an
     * SplObjectStorage containing all the resulting payload => writer
     * combinations.
     *
     * The writers are already merged at this point
     *
     * @param cscntLogPayload $payload
     * @return \SplObjectStorage
     */
    protected function routePayload( cscntLogPayload $payload )
    {
        $orRoute = new cscntLogOrRoute(
            $this->options->routes->getRawArray()
        );

        return $orRoute->route( $payload );
    }

    /**
     * Take a SplObjectStorage with payload and writer information and send out
     * the payloads to the assigned writers
     *
     * @param SplObjectStorage $payloads
     * @return void
     */
    protected function sendPayloadsToWriterIds( SplObjectStorage $payloads )
    {
        foreach( $payloads as $payload )
        {
            $writerIds = $payloads->getInfo();
            foreach( $writerIds as $writerId )
            {
                $writer = $this->getWriterById( $writerId );
                $this->sendPayloadToWriter( $payload, $writer );
            }
        }
    }

    /**
     * Get a Writer from the writercollection by its id.
     *
     * @param string $writerId
     * @return cscntLogWriter
     */
    protected function getWriterById( $writerId )
    {
        if( !isset( $this->options->writers[$writerId] ) )
        {
            throw new RuntimeException(
                "The writer with the id '$writerId' has been routed to, but it was not defined"
            );
        }

        return $this->options->writers[$writerId];
    }

    /**
     * Send a payload out to a given writer
     *
     * The optimal consumer/producer strategy to be used will be figured out
     * automatically.
     *
     * @param cscntLogPayload $payload
     * @param cscntLogWriter $writer
     * @return void
     */
    protected function sendPayloadToWriter( cscntLogPayload $payload, cscntLogWriter $writer )
    {
        $writer->setGroup( $this->group->toDashlessString() );

        $type = $this->getCoherence( $payload, $writer );
        $consumerMethod = 'from' . $type;
        $producerMethod = $type === 'String' ? '__to' . $type : 'to' . $type;

        try
        {
            $writer->$consumerMethod(
                $payload->severity,
                $payload->facility,
                $payload->id,
                $payload->$producerMethod()
            );
        }
        catch( \Exception $e )
        {
            if ($payload instanceof Payload\LoggerError) {
                // A writer may fail. Therefore any logger error state is catched here to
                // not disturb the further program execution. It is catched at this
                // level, to allow other writers to finish their job, eventhough
                // one specific writer fails.
                return;
            }

            // trying to log this error by logging a logger error payload
            $this->log(
                new Payload\LoggerError(
                    \cscntLogPayload::SEVERITY_ERROR,
                    \cscntLogFacility::LOGGER,
                    'logwriter',
                    $e,
                    'Failed to write payload to writer',
                    array(
                        'originalPayload' => $payload
                    )
                )
            );
        }
    }

    /**
     * Extract the prioritized type list from an arbitrary payload object.
     *
     * If the <tt>String</tt> type is not defined as last entry of the retrieved
     * priority list it will be automatically added.
     *
     * all retrieved types will be returned after having been processed by
     * ucfirst.
     *
     * @param cscntLogPayload $payload
     * @return array( string )
     */
    protected function extractPrioritizedTypes( cscntLogPayload $payload )
    {
        $types = $payload->getProducerPriority();
        array_map( "ucfirst", $types );

        if ( end( $types ) !== "String" )
        {
            $types[] = "String";
        }

        return $types;
    }

    /**
     * Find a matching type for a given writer
     *
     * The available types are provided as second argument.
     *
     * @param cscntLogWriter $writer
     * @param array $types
     * @return string
     */
    protected function findMatchingType( cscntLogWriter $writer, array $types )
    {
        foreach ( $types as $type )
        {
            $consumer = 'cscntLog' . $type . 'Consumer';
            if ( ( $writer instanceof $consumer ) === true )
            {
                return $type;
            }
        }

        throw new RuntimeException( "No matching consumer/producer type between writer and payload could be found. This should actually never happen, as String should always be a valid fallback." );
    }

    /**
     * Get the highest prioritized type which is compatible with the given
     * payload as well as the given writer.
     *
     * @param cscntLogPayload $payload
     * @param cscntLogWriter $writer
     * @return string
     */
    protected function getCoherence( cscntLogPayload $payload, cscntLogWriter $writer )
    {
        return $this->findMatchingType(
            $writer,
            $this->extractPrioritizedTypes(
                $payload
            )
        );
    }
}
