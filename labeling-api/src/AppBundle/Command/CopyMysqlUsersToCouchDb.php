<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Doctrine\ORM;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;

class CopyMysqlUsersToCouchDb extends Base
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * CopyMysqlUsersToCouchDb constructor.
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        parent::__construct();
        $this->documentManager = $documentManager;
    }

    protected function configure()
    {
        $this->setName('annostation:copyUserMySqlDbToCouchDb')
            ->setDescription('Copy all users from the MySQL Database to the CouchDB');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $users = $this->getAllMysqlUsers();
        $progress = new ProgressBar($output, count($users));

        $progress->start();
        foreach($users as $user) {
            $lastLogin = $user['last_login'] === null ? null : new \DateTime($user['last_login'], new \DateTimeZone('UTC'));
            $expiresAt = $user['expires_at'] === null ? null : new \DateTime($user['expires_at'], new \DateTimeZone('UTC'));

            $newUser = new Model\User();
            $newUser->setId($user['id']);
            $newUser->setUsername($user['username']);
            $newUser->setUsernameCanonical($user['username_canonical']);
            $newUser->setEmail($user['email']);
            $newUser->setEmailCanonical($user['email_canonical']);
            $newUser->setEnabled($user['enabled']);
            $newUser->setPassword($user['password']);
            $newUser->setLastLogin($lastLogin);
            $newUser->setLocked($user['locked']);
            $newUser->setExpired($user['expired']);
            $newUser->setExpiresAt($expiresAt);
            $newUser->setToken($user['token']);

            $roles = unserialize($user['roles']);
            $newUser->setRoles($roles);


            $this->documentManager->persist($newUser);
            $progress->advance();
        }
        $this->documentManager->flush();
        $progress->finish();
    }

    private function getAllMysqlUsers()
    {
        $sql = "SELECT * FROM users";

        /** @var ORM\EntityManager $em */
        $em = $this->getContainer()->get('doctrine')->getManager();
        $stmt = $em->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}