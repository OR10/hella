<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ORM;
use FOS\UserBundle\Model as FosUserModel;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

class User
{
    /**
     * @var FosUserModel\UserManager
     */
    private $userManager;

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * User constructor.
     *
     * @param FosUserModel\UserManager $userManager
     * @param CouchDB\DocumentManager  $documentManager
     * @param Storage\TokenStorage     $tokenStorage
     */
    public function __construct(
        FosUserModel\UserManager $userManager,
        CouchDB\DocumentManager $documentManager,
        Storage\TokenStorage $tokenStorage
    ) {
        $this->userManager     = $userManager;
        $this->documentManager = $documentManager;
        $this->tokenStorage    = $tokenStorage;
    }

    /**
     * @param $username
     * @param $email
     * @param $password
     *
     * @return FosUserModel\UserInterface
     */
    public function createUser($username, $email, $password, $enabled = true, $locked = false)
    {
        $user = $this->userManager->createUser();
        $user->setUsername($username);
        $user->setEmail($email);
        $user->setPlainPassword($password);
        $user->setEnabled($enabled);
        $user->setLocked($locked);

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
     * @param Model\User $user
     *
     * @return bool
     */
    public function deleteUser(Model\User $user)
    {
        $sessionUser = $this->tokenStorage->getToken()->getUser();

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
     * @return FosUserModel\UserInterface
     */
    public function getUserById($id)
    {
        return $this->documentManager->find(Model\User::class, $id);
    }

    /**
     * @param $token
     *
     * @return FosUserModel\UserInterface
     */
    public function getUserByToken($token)
    {
        return $this->userManager->findUserBy(array('token' => $token));
    }

    /**
     * @return Model\User[]
     */
    public function getUserList()
    {
        $users = $userProfileImages = $this->documentManager
            ->createQuery('annostation_user', 'by_id')
            ->onlyDocs(true)
            ->execute()
            ->toArray();

        return array_values(
            array_filter(
                $users,
                function (Model\User $user) {
                    if ($user->isLocked()) {
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
                    if ($user->isLocked()) {
                        return false;
                    }

                    return true;
                }
            );
        }

        return array_values($users);
    }

    /**
     * @param $role
     *
     * @return Model\User[]
     */
    public function getUserByRole($role)
    {
        return $this->documentManager
            ->createQuery('annostation_user_by_role_001', 'view')
            ->onlyDocs(true)
            ->setKey($role)
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
     * @return bool
     */
    public function isLabeler()
    {
        $user = $this->tokenStorage->getToken()->getUser();

        return $user->hasRole(Model\User::ROLE_LABELER);
    }

    /**
     * @return bool
     */
    public function isLabelCoordinator()
    {
        $user = $this->tokenStorage->getToken()->getUser();

        return $user->hasRole(Model\User::ROLE_LABEL_COORDINATOR);
    }

    /**
     * @return bool
     */
    public function isAdmin()
    {
        $user = $this->tokenStorage->getToken()->getUser();

        return $user->hasRole(Model\User::ROLE_ADMIN);
    }

    /**
     * @param Model\User    $user
     * @param Model\Project $project
     *
     * @return bool
     */
    public function hasPermissionForProject(Model\User $user, Model\Project $project)
    {
        if ($user->hasRole(Model\User::ROLE_CLIENT) && $project->getUserId() === $user->getId()) {
            return true;
        }

        if ($user->hasRole(Model\User::ROLE_LABEL_COORDINATOR)
            && $project->getLatestAssignedCoordinatorUserId() === $user->getId()
        ) {
            return true;
        }

        if ($user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_LABELER])) {
            return true;
        }

        return false;
    }
}
