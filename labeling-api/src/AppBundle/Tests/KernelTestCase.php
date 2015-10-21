<?php

namespace AppBundle\Tests;

use Doctrine\DBAL\Schema;
use Doctrine\ORM;
use Doctrine\ORM\Tools;
use Symfony\Bundle\FrameworkBundle\Test;

/**
 * Common base class for test cases that require the symfony kernel.
 */
class KernelTestCase extends Test\KernelTestCase
{
    const COUCHDB_CLIENT = 'doctrine_couchdb.client.default_connection';

    const ENTITY_MANAGER = 'doctrine.orm.entity_manager';

    /**
     * @var \Doctrine\CouchDB\CouchDBClient
     */
    protected $couchdbClient;

    /**
     * @var string
     */
    protected $couchDbName;

    /**
     * @var ORM\EntityManager
     */
    protected $entityManager;

    /**
     * Setup test case.
     *
     * This method is declared `final` to ensure the kernel is booted and the
     * database is set up.
     * Custom setup code should be placed in `setUpImplementation` instead.
     */
    public final function setUp()
    {
        parent::setUp();

        static::bootKernel(['test', true]);

        $container = static::$kernel->getContainer();

        $this->couchdbClient = $container->get(self::COUCHDB_CLIENT);
        $this->entityManager = $container->get(self::ENTITY_MANAGER);

        $this->couchDbName = $container->getParameter('database_name');

        $this->dropSchema();
        $this->generateSchema();

        $this->couchdbClient->deleteDatabase($this->couchDbName);
        $this->couchdbClient->createDatabase($this->couchDbName);

        $this->setUpImplementation();
    }

    /**
     * Tear down test case.
     *
     * This method is declared `final` to ensure the kernel is shut down and
     * the database is cleared.
     * Custom teardown code should be placed in `tearDownImplementation`
     * instead.
     */
    public final function tearDown()
    {
        $this->tearDownImplementation();

        $this->couchdbClient->deleteDatabase($this->couchDbName);
        $this->dropSchema();

        static::$kernel->shutdown();

        parent::tearDown();
    }

    protected function setUpImplementation()
    {
    }

    protected function tearDownImplementation()
    {
    }

    /**
    * Create the database schema.
    */
    protected function generateSchema()
    {
        // Get the metadata of the application to create the schema.
        $metadata = $this->getMetadata();

        if (!empty($metadata)) {
            $tool = new Tools\SchemaTool($this->entityManager);
            $tool->createSchema($metadata);
        } else {
            throw new Schema\SchemaException('No Metadata Classes to process.');
        }
    }

    /**
    * Drop the database schema in order to cleanup for other tests.
    */
    protected function dropSchema()
    {
        $metadata = $this->getMetadata();

        if (!empty($metadata)) {
            $tool = new Tools\SchemaTool($this->entityManager);
            $tool->dropSchema($metadata);
        } else {
            throw new Schema\SchemaException('No Metadata Classes to process.');
        }
    }

    /**
    * Overwrite this method to get specific metadata.
    *
    * @return Array
    */
    protected function getMetadata()
    {
        return $this->entityManager->getMetadataFactory()->getAllMetadata();
    }
}
