<?php

namespace crosscan\WorkerPool\Serializer;

use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP\RescheduleMessage;
use crosscan\WorkerPool\Job;
use crosscan\WorkerPool\Exception;

/**
 * Basic PHP serializer
 *
 * This serializer uses phps serialize and unserialize functions to create a
 * string representaiton of a job.
 *
 * It also contains a workaround for broken DateTime serializations.
 */
class PhpSerialize extends WorkerPool\Serializer
{
    /**
     * @param Job $job
     *
     * @return string payload
     */
    function serialize(Job $job)
    {
        return serialize($job);
    }

    /**
     * @param string $payload
     *
     * @return Job
     */
    function unserialize($payload)
    {
        return $this->genericUnserialize($payload);
    }

    /**
     * @param RescheduleMessage $rescheduleMessage
     *
     * @return string
     */
    function serializeRescheduleMessage(RescheduleMessage $rescheduleMessage)
    {
        return serialize($rescheduleMessage);
    }

    /**
     * @param string $payload
     *
     * @return RescheduleMessage
     */
    function unserializeRescheduleMessage($payload)
    {
        $this->genericUnserialize($payload);
    }

    private function genericUnserialize($payload)
    {
        // In some cases PHP failed to serialize DateTime correctly. The unserialize will fail.
        if (strpos($payload, 'O:8:"DateTime":0:{}') !== false) {
            throw new Exception\UnserializeFailed('DateTime seems to be unserializeable');
        }

        return unserialize($payload);
    }
}
