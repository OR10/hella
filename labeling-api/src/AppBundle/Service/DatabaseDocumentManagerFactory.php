<?php

namespace AppBundle\Service;

use Doctrine\CouchDB;
use Doctrine\ODM\CouchDB as CouchDBODM;

class DatabaseDocumentManagerFactory
{
    /**
     * @var CouchDBODM\DocumentManager
     */
    private $documentManager;

    /**
     * @var CouchDBODM\DocumentManager[]
     */
    private $documentManagerCache = [];

    public function __construct(CouchDBODM\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * This methods return a new document manager for a given database.
     *
     * @param $databaseName
     *
     * @return CouchDBODM\DocumentManager
     */
    public function getDocumentManagerForDatabase($databaseName)
    {
        if (!isset($this->documentManagerCache[$databaseName])) {
            $this->documentManagerCache[$databaseName] = new CouchDBODM\DocumentManager(
                new CouchDB\CouchDBClient($this->documentManager->getHttpClient(), $databaseName),
                $this->documentManager->getConfiguration(),
                $this->documentManager->getEventManager()
            );
        }

        return $this->documentManagerCache[$databaseName];
    }

    /**
     * Create a new database with the given name and return the documentManager for the new database
     *
     * @param $databaseName
     *
     * @return CouchDBODM\DocumentManager
     */
    public function createDatabase($databaseName)
    {
        $this->documentManager->getCouchDBClient()->createDatabase($databaseName);

        return $this->getDocumentManagerForDatabase($databaseName);
    }
}