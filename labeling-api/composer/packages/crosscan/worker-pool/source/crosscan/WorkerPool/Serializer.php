<?php


namespace crosscan\WorkerPool;

use crosscan\WorkerPool\AMQP\RescheduleMessage;

/**
 * Job Serializers
 *
 * Serializers are responsible for encoding jobs (which are objects) into strings,
 * which can be delivered to the WorkerPool backend such as AMQP.
 */
abstract class Serializer
{
    /**
     * @param Job $job
     *
     * @return string payload
     */
    abstract function serialize(Job $job);

    /**
     * @param string $payload
     *
     * @return Job
     */
    abstract function unserialize($payload);

    /**
     * @param RescheduleMessage $rescheduleMessage
     *
     * @return string
     */
    abstract function serializeRescheduleMessage(RescheduleMessage $rescheduleMessage);

    /**
     * @param string $payload
     *
     * @return RescheduleMessage
     */
    abstract function unserializeRescheduleMessage($payload);
}
