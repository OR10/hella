<?php

namespace AnnoStationBundle\Tests;

use AnnoStationBundle\Database;
use AnnoStationBundle\Model as AnnoStationBundleModel;
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
     * Create a persisted SuperAdmin with its username as password.
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return Model\User
     */
    protected function createSuperAdminUser(AnnoStationBundleModel\Organisation $organisation = null)
    {
        $user = Helper\UserBuilder::createDefaultSuperAdmin();
        if ($organisation instanceof AnnoStationBundleModel\Organisation) {
            $user->withOrganisations([$organisation]);
        }

        return $this->userFacade->updateUser($user->build());
    }

    /**
     * Create a persisted SuperAdmin with its username as password.
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return Model\User
     */
    protected function createLabelManagerUser(AnnoStationBundleModel\Organisation $organisation = null)
    {
        $user = Helper\UserBuilder::createDefaultLabelManager();
        if ($organisation instanceof AnnoStationBundleModel\Organisation) {
            $user->withOrganisations([$organisation]);
        }

        return $this->userFacade->updateUser($user->build());
    }

    /**
     * Create a persisted labeler with its username as password.
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return Model\User
     */
    protected function createLabelerUser(AnnoStationBundleModel\Organisation $organisation = null)
    {
        $user = Helper\UserBuilder::createDefaultLabeler();
        if ($organisation instanceof AnnoStationBundleModel\Organisation) {
            $user->withOrganisations([$organisation]);
        }

        return $this->userFacade->updateUser($user->build());
    }
}
