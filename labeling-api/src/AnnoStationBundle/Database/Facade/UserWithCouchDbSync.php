<?php

namespace AnnoStationBundle\Database\Facade;

use AppBundle\Database\Facade as AppBundleFacade;
use AppBundle\Model as AppBundleModel;
use Doctrine\ODM\CouchDB;
use FOS\UserBundle\Model as FosUserModel;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use GuzzleHttp;

class UserWithCouchDbSync extends AppBundleFacade\User
{
    /**
     * @var string
     */
    private $couchAuthUser;

    /**
     * @var string
     */
    private $couchAuthPassword;

    /**
     * @var string
     */
    private $couchHost;

    /**
     * @var string
     */
    private $couchPort;

    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

    /**
     * @var AppBundleFacade\CouchDbUsers
     */
    private $couchDbFacade;

    public function __construct(
        FosUserModel\UserManagerInterface $userManager,
        CouchDB\DocumentManager $documentManager,
        Storage\TokenStorageInterface $tokenStorage,
        GuzzleHttp\Client $guzzleClient,
        $couchAuthUser,
        $couchAuthPassword,
        $couchHost,
        $couchPort,
        AppBundleFacade\CouchDbUsers $couchDbFacade
    ) {
        parent::__construct($userManager, $documentManager, $tokenStorage);

        $this->couchAuthUser     = $couchAuthUser;
        $this->couchAuthPassword = $couchAuthPassword;
        $this->couchHost         = $couchHost;
        $this->couchPort         = $couchPort;
        $this->guzzleClient      = $guzzleClient;
        $this->couchDbFacade     = $couchDbFacade;
    }

    /**
     * @param string $username
     * @param string $email
     * @param string $password
     * @param bool   $enabled
     * @param bool   $locked
     * @param array  $settings
     * @param array  $organisations
     *
     * @return \AppBundle\Model\User|FosUserModel\UserInterface
     */
    public function createUser(
        $username,
        $email,
        $password,
        $enabled = true,
        $locked = false,
        $settings = [],
        $organisations = []
    ) {
        $user = parent::createUser($username, $email, $password, $enabled, $locked, $settings, $organisations);

        $this->couchDbFacade->updateUser($username, $password);

        return $user;
    }

    /**
     * @param AppBundleModel\User $user
     *
     * @return AppBundleModel\User
     */
    public function updateUser(AppBundleModel\User $user)
    {
        $password = $user->getPlainPassword();
        $user     = parent::updateUser($user);

        if ($password !== null) {
            $this->couchDbFacade->updateUser($user->getUsername(), $password);
        }

        return $user;
    }

    /**
     * @param AppBundleModel\User $user
     *
     * @return bool
     */
    public function deleteUser(AppBundleModel\User $user)
    {
        parent::deleteUser($user);

        $this->couchDbFacade->deleteUser($user->getUsername());

        return true;
    }
}