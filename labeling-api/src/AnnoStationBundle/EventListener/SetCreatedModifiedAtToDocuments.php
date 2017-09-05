<?php

namespace AnnoStationBundle\EventListener;

use AnnoStationBundle\Helper;
use Doctrine\Common\EventSubscriber;
use Doctrine\ODM\CouchDB\Event\LifecycleEventArgs;


class SetCreatedModifiedAtToDocuments implements EventSubscriber
{
    /**
     * @var Helper\SystemDateTimeProvider
     */
    private $systemTimeProvider;

    /**
     * SetCreatedModifiedAtToDocuments constructor.
     * @param Helper\SystemDateTimeProvider $systemTimeProvider
     */
    public function __construct(Helper\SystemDateTimeProvider $systemTimeProvider)
    {
        $this->systemTimeProvider = $systemTimeProvider;
    }

    /**
     * @param LifecycleEventArgs $args
     */
    public function prePersist(LifecycleEventArgs $args)
    {
        $doc = $args->getDocument();

        if (method_exists($doc, 'setCreatedAt')) {
            $doc->setCreatedAt($this->systemTimeProvider->getDateTime('now', new \DateTimeZone('UTC')));
        }
    }

    /**
     * @param LifecycleEventArgs $args
     */
    public function preUpdate(LifecycleEventArgs $args)
    {
        $doc = $args->getDocument();

        if (method_exists($doc, 'setLastModifiedAt')) {
            $doc->setLastModifiedAt($this->systemTimeProvider->getDateTime('now', new \DateTimeZone('UTC')));
        }
    }

    /**
     * Returns an array of events this subscriber wants to listen to.
     *
     * @return array
     */
    public function getSubscribedEvents()
    {
        return [
            'prePersist',
            'preUpdate',
        ];
    }
}