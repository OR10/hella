<?php

namespace Hagl\WorkerPoolBundle\EventHandler;

use crosscan\WorkerPool\Job;
use crosscan\WorkerPool\EventHandler;
use Doctrine\Common\Persistence\ObjectManager;

/**
 * Simple EventHandler which clears the identity map of an ObjectManager after each Job execution.
 */
class DoctrineIdentityMapReset extends EventHandler\NoOp
{
    /**
     * @var ObjectManager
     */
    private $objectManager;

    /**
     * @param ObjectManager $objectManager
     */
    public function __construct(ObjectManager $objectManager)
    {
        $this->objectManager = $objectManager;
    }

    public function jobFinished(Job $job)
    {
        $this->objectManager->clear();
    }
}
