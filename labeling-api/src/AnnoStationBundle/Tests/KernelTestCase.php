<?php

namespace AnnoStationBundle\Tests;

use AnnoStationBundle\Database;
use AppBundle\Model;
use AppBundle\Tests as AppBundleTests;
use AppBundle\Tests\Helper;
use Doctrine\ORM;
use FOS\UserBundle;
use FOS\UserBundle\Util;
use JMS\Serializer;
use Symfony\Bundle\FrameworkBundle\Test;

/**
 * Common base class for test cases that require the symfony kernel.
 */
class KernelTestCase extends AppBundleTests\KernelTestCase
{
    /**
     * @var Database\Facade\User
     */
    protected $userFacade;
    /**
     * Create a persisted client with its username as password.
     *
     * @return Model\User
     */
    protected function createClientUser()
    {
        return $this->userFacade->updateUser(Helper\UserBuilder::createDefaultClient()->build());
    }

    /**
     * Create a persisted label coordinator with its username as password.
     *
     * @return Model\User
     */
    protected function createLabelCoordinatorUser()
    {
        return $this->userFacade->updateUser(Helper\UserBuilder::createDefaultLabelCoordinator()->build());
    }

    /**
     * Create a persisted labeler with its username as password.
     *
     * @return Model\User
     */
    protected function createLabelerUser()
    {
        return $this->userFacade->updateUser(Helper\UserBuilder::createDefaultLabeler()->build());
    }

    /**
     * Create a persisted SuperAdmin with its username as password.
     *
     * @return Model\User
     */
    protected function createSuperAdminUser()
    {
        return $this->userFacade->updateUser(Helper\UserBuilder::createDefaultSuperAdmin()->build());
    }
}
