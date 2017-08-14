<?php

use crosscan\Std;
use crosscan\Logger\Message\StringOnly as StringOnlyMessage;

/**
 * Log writer that writes messages to
 */
class cscntLogGelfWriter extends cscntLogWriter
    implements cscntLogHierarchicalArrayStructConsumer
{
    /**
     * Currently active groupId
     *
     * @var string
     */
    protected $group = null;

    /**
     * The GELF Publisher
     *
     * @var \Gelf\PublisherInterface
     */
    protected $publisher;

    public function __construct(\Gelf\PublisherInterface $publisher)
    {
        $this->publisher = $publisher;
    }

    /**
     * Returns the syslog loglevel for a corresponding cscntLogger Severity
     * @param $severity
     * @return int
     */
    protected function getLogLevelForGelf($severity)
    {

        static $logLevelMapping = array(
            cscntLogPayload::SEVERITY_DEBUG   => LOG_DEBUG,
            cscntLogPayload::SEVERITY_INFO    => LOG_INFO,
            cscntLogPayload::SEVERITY_WARNING => LOG_WARNING,
            cscntLogPayload::SEVERITY_ERROR   => LOG_ERR,
            cscntLogPayload::SEVERITY_FATAL   => LOG_EMERG,
        );

        return $logLevelMapping[$severity];
    }


    /**
     * Create a new Gelf Log Writer for the given graylog server
     * @static
     * @param $host
     * @return cscntLogGelfWriter
     */
    public static function create($host)
    {
        $transport = new \Gelf\Transport\UdpTransport($host);

        return new self(
            new \Gelf\Publisher(
                $transport
            )
        );
    }


    /**
     * Set the unique identifier of the group of log messages to be processed
     * next.
     *
     * Every log payload processed after a call to this method does belong to
     * the given uuid.
     *
     * @return void
     */
    public function setGroup($uuid)
    {
        $this->group = $uuid;
    }

    /**
     * Write a string based payload
     *
     * @param mixed $severity
     * @param mixed $facility
     * @param mixed $id
     * @param mixed $logData
     * @return void
     */
    public function fromString($severity, $facility, $id, $logData)
    {
        $message = $this->createMessage($severity, $facility);
        $message->setShortMessage($logData);
        $message->setAdditional('logId', (string) $id);
        $this->publisher->publish($message);
    }

    /**
     * Consume a given StdClass as hierarchical array structure.
     *
     * @param mixed $severity
     * @param mixed $facility
     * @param mixed $id
     * @param array $data
     * @return void
     */
    public function fromHierarchicalArrayStruct($severity, $facility, $id, array $data)
    {
        $message = $this->createMessage($severity, $facility);
        $message->setAdditional('logId', (string) $id);

        if(isset($data['message'])) {
            $message->setShortMessage($data['message']);
        } else {
            $message->setShortMessage(json_encode($data));
        }

        if(isset($data['fullMessage'])) {
            $message->setFullMessage($data['fullMessage']);
            unset($data['fullMessage']);
        }

        unset($data['password']);

        $this->addAdditionalsToMessage($data, $message);

        $this->publisher->publish($message);
    }

    protected function addAdditionalsToMessage(array $data, \Gelf\Message $message, $prefix = '')
    {
        foreach ( $data as $key => $value )
        {
            if (!is_string($key)) {
                // setAdditional(..) will not behave as expected if the key is not a string
                continue;
            }

            if ($key === 'code') {
                // make sure this is always a string to avoid problems with the elasticsearch index
                $value = (string) $value;
            }

            if (is_scalar($value)) {
                $message->setAdditional($prefix . $key, $value);
            } elseif (is_array($value)) {
                $this->addAdditionalsToMessage($value, $message, $prefix . $key . '.');
            }
        }
    }

    /**
     * Create a new gelf message for the given severity & facility
     *
     * @param int $severity
     * @param string $facility
     * @return Gelf\Message
     */
    protected function createMessage($severity, $facility)
    {
        $message = new StringOnlyMessage();
        $message->setLevel($this->getLogLevelForGelf($severity))
            ->setTimestamp(time())
            ->setFacility($facility)
            ->setHost(gethostname())
            ->setAdditional('cscntRequestId', (string) $this->group);

        if (function_exists('posix_getpid')) {
            $message->setAdditional('PID', posix_getpid());
        }

        return $message;
    }
}
