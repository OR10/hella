<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ORM;
use FOS\UserBundle\Model as FosUserModel;

class User
{
    /**
     * @var ORM\EntityManager
     */
    private $entityManager;
    /**
     * @var FosUserModel\UserManager
     */
    private $userManager;

    function __construct(
        ORM\EntityManager $entityManager,
        FosUserModel\UserManager $userManager
    ) {
        $this->entityManager = $entityManager;
        $this->userManager   = $userManager;
    }

    public function createUser($username, $email, $password)
    {
        $user = $this->userManager->createUser();
        $user->setUsername($username);
        $user->setEmail($email);
        $user->setPassword($password);

        $this->userManager->updateUser($user);

        return $user;
    }

    public function getUserById($id)
    {
        return $this->userManager->findUserBy(array('id' => $id));
    }
}