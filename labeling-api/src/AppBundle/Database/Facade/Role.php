<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model as Model;
use AppBundle\Service\UuidGenerator;
use Doctrine\ODM\CouchDB\DocumentManager;

class Role
{
    /**
     * @var DocumentManager
     */
    private $documentManager;

    /**
     * @var UuidGenerator
     */
    private $uuidGenerator;

    /**
     * Role constructor.
     *
     * @param DocumentManager $documentManager
     * @param UuidGenerator   $uuidGenerator
     */
    public function __construct(DocumentManager $documentManager, UuidGenerator $uuidGenerator)
    {
        $this->documentManager = $documentManager;
        $this->uuidGenerator   = $uuidGenerator;
    }

    /**
     * @param string $projectId
     * @param string $roleName
     * @param array  $permissions
     *
     * @return Model\Role
     */
    public function createRole(string $projectId, string $roleName, array $permissions)
    {
        $role = new Model\Role($this->uuidGenerator->generateUuid(), $projectId, $roleName, $permissions);
        $this->documentManager->persist($role);
        $this->documentManager->flush();

        return $role;
    }

}
