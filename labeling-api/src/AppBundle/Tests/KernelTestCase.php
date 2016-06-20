<?php

namespace AppBundle\Tests;

use Doctrine\DBAL\Schema;
use Doctrine\ORM;
use Doctrine\ORM\Tools;
use JMS\Serializer;
use Symfony\Bundle\FrameworkBundle\Test;

/**
 * Common base class for test cases that require the symfony kernel.
 */
class KernelTestCase extends Test\KernelTestCase
{
    const BUNDLE_NAME = 'AppBundle';

    const COUCHDB_CLIENT = 'doctrine_couchdb.client.default_connection';

    const ENTITY_MANAGER = 'doctrine.orm.entity_manager';

    const ANNOSTATION_SERVICE_PATTERN = 'annostation.labeling_api.%s';

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
    final public function setUp()
    {
        parent::setUp();

        static::bootKernel(['test', true]);

        $this->couchdbClient = $this->getService(self::COUCHDB_CLIENT);
        $this->entityManager = $this->getService(self::ENTITY_MANAGER);

        $this->couchDbName = $this->getContainer()->getParameter('database_name');

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
    final public function tearDown()
    {
        $this->tearDownImplementation();

        $this->couchdbClient->deleteDatabase($this->couchDbName);

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
    * Overwrite this method to get specific metadata.
    *
    * @return Array
    */
    protected function getMetadata()
    {
        return $this->entityManager->getMetadataFactory()->getAllMetadata();
    }

    /**
     * Get the DI container.
     */
    protected function getContainer()
    {
        return static::$kernel->getContainer();
    }

    /**
     * Get the service identified by $name.
     *
     * @param string $name
     *
     * @return mixed
     */
    protected function getService($name)
    {
        return $this->getContainer()->get($name);
    }

    /**
     * Get the annostation service identified by $name.
     *
     * @param string $name
     *
     * @return mixed
     */
    protected function getAnnostationService($name)
    {
        return $this->getService(sprintf(self::ANNOSTATION_SERVICE_PATTERN, $name));
    }

    /**
     * Get an absolute path to the bundle.
     */
    protected function getBundlePath()
    {
        return static::$kernel->locateResource(sprintf('@%s', self::BUNDLE_NAME));
    }

    /**
     * @param mixed $object
     *
     * @return array
     */
    protected function serializeObjectAsArray($object)
    {
        return json_decode(
            $this->getService('serializer')
                ->serialize(
                    $object,
                    'json',
                    Serializer\SerializationContext::create()
                        ->setSerializeNull(true)
                ),
            true
        );
    }
}
