<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use Doctrine\ODM\CouchDB;
use FOS\UserBundle\Model as FosUserModel;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

class User
{
    /**
     * @var FosUserModel\UserManagerInterface
     */
    private $userManager;

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @var Storage\TokenStorageInterface
     */
    private $tokenStorage;

    /**
     * User constructor.
     *
     * @param FosUserModel\UserManagerInterface $userManager
     * @param CouchDB\DocumentManager           $documentManager
     * @param Storage\TokenStorageInterface     $tokenStorage
     */
    public function __construct(
        FosUserModel\UserManagerInterface $userManager,
        CouchDB\DocumentManager $documentManager,
        Storage\TokenStorageInterface $tokenStorage
    ) {
        $this->userManager     = $userManager;
        $this->documentManager = $documentManager;
        $this->tokenStorage    = $tokenStorage;
    }

    /**
     * @param string      $username
     * @param string      $email
     * @param string      $password
     * @param bool        $enabled
     * @param bool        $locked
     * @param array       $settings
     * @param array       $organisations
     * @param null|string $couchDbPassword
     *
     * @return Model\User|FosUserModel\UserInterface
     */
    public function createUser(
        $username,
        $email,
        $password,
        $enabled = true,
        $locked = false,
        $settings = [],
        $organisations = [],
        $couchDbPassword = null
    ) {
        /** @var Model\User $user */
        $user = $this->userManager->createUser();
        $user->setUsername($username);
        $user->setEmail($email);
        $user->setPlainPassword($password);
        $user->setEnabled($enabled);
        $user->setLocked($locked);
        $user->setSettings($settings);
        $user->setOrganisations($organisations);
        $user->setCouchDbPassword($couchDbPassword);

        $this->userManager->updateUser($user);

        return $user;
    }

    /**
     * @param Model\User $user
     * @param string     $projectId
     * @param Model\Role $role
     *
     * @return Model\User
     */
    public function assignRoleToUser(Model\User $user, string $projectId, Model\Role $role)
    {
        $user->assignRole($projectId, $role);
        $this->userManager->updateUser($user);

        return $user;
    }

    /**
     * @param Model\User $user
     *
     * @return Model\User
     */
    public function updateUser(Model\User $user)
    {
        $this->userManager->updateUser($user);

        return $user;
    }

    /**
     * @param array $settings
     */
    public function updateSettingsForCurrentUser(array $settings)
    {
        $user = $this->getCurrentUser();
        $user->setSettings(array_merge($user->getSettings(), $settings));
        $this->userManager->updateUser($user);
    }

    /**
     * @param Model\User $user
     * @param array      $settings
     *
     * @return Model\User
     */
    public function updateSettings(Model\User $user, array $settings)
    {
        $user->setSettings($settings);
        $this->userManager->updateUser($user);

        return $user;
    }

    /**
     * @param Model\User $user
     *
     * @return bool
     */
    public function deleteUser(Model\User $user)
    {
        $sessionUser = $this->tokenStorage->getToken()->getUser();

        $user->setUsername(sprintf('deleted_%s_%s', $user->getUsername(), $user->getId()));
        $user->setEmail(sprintf('deleted_%s_%s', $user->getId(), $user->getEmail()));
        $user->setLocked(true);
        $user->addLockHistoryEntry(
            $sessionUser,
            new \DateTime('now', new \DateTimeZone('UTC'))
        );
        $this->userManager->updateUser($user);

        return true;
    }

    /**
     * @param $id
     *
     * @return Model\User|FosUserModel\UserInterface
     */
    public function getUserById($id)
    {
        return $this->documentManager->find(Model\User::class, $id);
    }

    /**
     * @param $token
     *
     * @return Model\User|FosUserModel\UserInterface
     */
    public function getUserByToken($token)
    {
        return $this->userManager->findUserBy(array('token' => $token));
    }

    /**
     * @return Model\User
     */
    public function getCurrentUser()
    {
        if ($this->tokenStorage->getToken() === null) {
            return null;
        }
        
        return $this->tokenStorage->getToken()->getUser();
    }

    /**
     * @param string $username
     *
     * @return Model\User|FosUserModel\UserInterface
     */
    public function getUserByUsername(string $username)
    {
        return $this->userManager->findUserByUsername($username);
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return Model\User[]
     */
    public function getUserList(AnnoStationBundleModel\Organisation $organisation = null)
    {
        if ($organisation === null) {
            $users = $this->documentManager
                ->createQuery('annostation_user', 'by_id')
                ->onlyDocs(true)
                ->execute()
                ->toArray();
        } else {
            $users = $this->documentManager
                ->createQuery('annostation_user_by_organisation', 'view')
                ->setKey([$organisation->getId()])
                ->onlyDocs(true)
                ->execute()
                ->toArray();
        }

        return array_values(
            array_filter(
                $users,
                function (Model\User $user) {
                    if (!$user->isAccountNonLocked()) {
                        return false;
                    }

                    return true;
                }
            )
        );
    }

    /**
     * @param array $userIds
     * @param bool  $ignoreLocked
     *
     * @return Model\User[]
     */
    public function getUserByIds(array $userIds, $ignoreLocked = true)
    {
        $idsInChunks = array_chunk($userIds, 100);
        $users       = array();
        foreach ($idsInChunks as $idsInChunk) {
            $users = array_merge(
                $users,
                $this->documentManager
                    ->createQuery('annostation_user', 'by_id')
                    ->onlyDocs(true)
                    ->setKeys($idsInChunk)
                    ->execute()
                    ->toArray()
            );
        }

        if ($ignoreLocked) {
            $users = array_filter(
                $users,
                function (Model\User $user) {
                    if (!$user->isAccountNonLocked()) {
                        return false;
                    }

                    return true;
                }
            );
        }

        return array_values($users);
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param                                     $role
     *
     * @return Model\User[]
     */
    public function getUsersByOrganisationAndRole(AnnoStationBundleModel\Organisation $organisation, $role)
    {
        return $this->documentManager
            ->createQuery('annostation_user_by_organisation_and_role_001', 'view')
            ->onlyDocs(true)
            ->setKey([$organisation->getId(), $role])
            ->execute();
    }

    /**
     * @param $role
     *
     * @return Model\User[]
     */
    public function getUsersByRole($role)
    {
        return $this->documentManager
            ->createQuery('annostation_user_by_role_001', 'view')
            ->onlyDocs(true)
            ->setKey([$role])
            ->execute();
    }

    /**
     * Returns the user profile image raw data
     *
     * @param Model\User $user
     *
     * @return null|String
     */
    public function getUserProfileImage(Model\User $user)
    {
        $userProfileImages = $this->documentManager
            ->createQuery('annostation_user_profile_image', 'by_user_id')
            ->setStartKey($user->getId())
            ->setEndKey($user->getId())
            ->onlyDocs(true)
            ->execute()
            ->toArray();
        if (empty($userProfileImages)) {
            return null;
        }
        $userProfileImage = reset($userProfileImages)->getImage();

        $image = reset($userProfileImage);

        return $image->getRawData();
    }

    /**
     * @param Model\User $user
     */
    public function saveUser(Model\User $user)
    {
        $this->userManager->updateUser($user);
    }
}
