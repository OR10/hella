<?php

namespace crosscan\Logger\Payload;

/**
 * A class representing an internal logger error payload, which gets tried to be logged at least one time before it gets
 * ignored
 *
 * @internal
 */
class LoggerError extends ExceptionWithStringAndContext
{
}