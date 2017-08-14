<?php

namespace crosscan\WorkerPool\Exception;

use crosscan\WorkerPool;

/**
 * This exception indicates that something failed, but should be tried again.
 *
 * If a job throws this exception, it will be put into the reschedule-queue,
 * which will be re-executed every n seconds.
 */
class Recoverable extends WorkerPool\Exception
{

}
