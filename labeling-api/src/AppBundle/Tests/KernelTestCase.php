<?php

namespace AppBundle\Tests;

use AppBundle\Database;
use AppBundle\Model;
use Doctrine\ORM;
use FOS\UserBundle;
use FOS\UserBundle\Util;
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

    const USERNAME = 'user';
    const PASSWORD = 'password';
    const EMAIL    = 'user@example.com';

    /**
     * @var \Doctrine\CouchDB\CouchDBClient
     */
    protected $couchdbClient;

    /**
     * @var string
     */
    protected $couchDbName;

    /**
     * @var string
     */
    private $couchDbNameReadOnly;

    /**
     * @var ORM\EntityManager
     */
    protected $entityManager;

    /**
     * @var Util\UserManipulator
     */
    protected $userService;

    /**
     * @var Database\Facade\User
     */
    protected $userFacade;

    /**
     * @var Model\User|UserBundle\Model\UserInterface
     */
    protected $defaultUser;

    /**
     * @var Database\Facade\CouchDbUsers
     */
    private $couchDbUsersFacade;

    protected static function getKernelClass()
    {
        require __DIR__ . '/../../../app/AnnoStation/AnnoStationKernel.php';

        return \AnnoStationKernel::class;
    }

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

        $this->couchdbClient      = $this->getService(self::COUCHDB_CLIENT);
        $this->entityManager      = $this->getService(self::ENTITY_MANAGER);
        $this->userService        = $this->getService('fos_user.util.user_manipulator');
        $this->userFacade         = $this->getAnnostationService('database.facade.user');
        $this->couchDbUsersFacade = $this->getAnnostationService('database.facade.couchdb_users');

        $this->couchDbName         = $this->getContainer()->getParameter('database_name');
        $this->couchDbNameReadOnly = $this->getContainer()->getParameter('database_name_read_only');

        $this->couchdbClient->deleteDatabase($this->couchDbName);
        $this->couchdbClient->deleteDatabase($this->couchDbNameReadOnly);
        $this->couchdbClient->createDatabase($this->couchDbName);
        $this->couchdbClient->createDatabase($this->couchDbNameReadOnly);
        $this->couchDbUsersFacade->purgeCouchDbsUserDatabase();

        $systemDateTimeMock = \Phake::mock('AnnoStationBundle\Helper\SystemDateTimeProvider');
        \Phake::when($systemDateTimeMock)->getDateTime->thenReturn(new \DateTime('2017-03-10 10:00'));

        $eventListenerMock = \Phake::partialMock('AnnoStationBundle\EventListener\SetCreatedModifiedAtToDocuments', $systemDateTimeMock);

        /** @var \Doctrine\Common\EventManager $eventManager */
        $eventManager = $this->getService('doctrine_couchdb.odm.default_connection.event_manager');
        $eventManager->removeEventSubscriber($this->getAnnostationService('event_listener.set_created_modified_at_to_documents'));
        $eventManager->addEventSubscriber($eventListenerMock);

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
        $this->couchdbClient->deleteDatabase($this->couchDbNameReadOnly);
        $this->couchDbUsersFacade->purgeCouchDbsUserDatabase();

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
     * @return array
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
     * Set a service with identified by $name.
     *
     * @param string $name
     * @param        $service
     * @return mixed
     */
    protected function setService($name, $service)
    {
        return $this->getContainer()->set($name, $service);
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

    /**
     * Create and store a default user usable for tests.
     */
    protected function createDefaultUser()
    {
        $this->defaultUser = $this->userService->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }
}
