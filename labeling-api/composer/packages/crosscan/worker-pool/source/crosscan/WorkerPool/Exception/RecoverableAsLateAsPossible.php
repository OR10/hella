<?php

namespace crosscan\WorkerPool\Exception;

/**
 * This exception indicates that something failed, but should be tried again.
 *
 * If a job throws this exception, it will be put into the 15min reschedule-queue directly.
 * So we ensure that we do not try it directly again, but much later.
 */
class RecoverableAsLateAsPossible extends Recoverable
{

}