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
     * @param FosUserModel\UserManager $userManager
     * @param CouchDB\DocumentManager $documentManager
     * @param Storage\TokenStorage $tokenStorage
     */
    public function __construct(
        FosUserModel\UserManager $userManager,
        CouchDB\DocumentManager $documentManager,
        Storage\TokenStorage $tokenStorage
    ) {
        $this->userManager = $userManager;
        $this->documentManager = $documentManager;
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * @param $username
     * @param $email
     * @param $password
     * @return FosUserModel\UserInterface
     */
    public function createUser($username, $email, $password)
    {
        $user = $this->userManager->createUser();
        $user->setUsername($username);
        $user->setEmail($email);
        $user->setPassword($password);

        $this->userManager->updateUser($user);

        return $user;
    }

    /**
     * @param $id
     * @return FosUserModel\UserInterface
     */
    public function getUserById($id)
    {
        return $this->userManager->findUserBy(array('id' => $id));
    }

    /**
     * Returns the user profile image raw data
     *
     * @param Model\User $user
     * @return null|String
     */
    public function getUserProfileImage(Model\User $user)
    {
        $userProfileImages =  $this->documentManager
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

        return $user->hasRole('ROLE_LABELER');
    }

    /**
     * @return bool
     */
    public function isLabelCoordinator()
    {
        $user = $this->tokenStorage->getToken()->getUser();

        return $user->hasRole('ROLE_LABEL_COORDINATOR');
    }

    /**
     * @return bool
     */
    public function isAdmin()
    {
        $user = $this->tokenStorage->getToken()->getUser();

        return $user->hasRole('ROLE_ADMIN');
    }
}
