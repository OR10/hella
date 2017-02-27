<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model as Model;
use AppBundle\Service\UuidGenerator;
use Doctrine\ODM\CouchDB\DocumentManager;

/**
 * Class Role
 * @package AppBundle\Database\Facade
 */
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
     * @param string $label
     * @param array  $permissions
     *
     * @return Model\Role
     */
    public function createRole(string $projectId, string $roleName, string $label, array $permissions)
    {
        $role = new Model\Role($this->uuidGenerator->generateUuid(), $projectId, $roleName, $label, $permissions);
        $this->documentManager->persist($role);
        $this->documentManager->flush();

        return $role;
    }

    /**
     * @param string $projectId
     * @param string $roleName
     *
     * @return Model\Role
     */
    public function getRole(string $projectId, string $roleName)
    {
        $roles = $this->documentManager->createQuery('annostation_roles', 'roles_by_project_and_name')
            ->onlyDocs(true)
            ->setStartKey([$projectId, $roleName])
            ->setEndKey([$projectId, $roleName])
            ->execute()
            ->toArray();

        if (count($roles) != 1) {
            throw new \InvalidArgumentException(sprintf("unknown role %s in project %s", $roleName, $projectId));
        }

        return $roles[0];
    }

    /**
     * @param string     $projectId
     * @param Model\Role $role
     *
     * @return \string[]
     */
    public function getPermissionsForRole(string $projectId, Model\Role $role)
    {
        $roleName = $role->getName();

        return $this->getRole($projectId, $roleName)->getPermissions();
    }

}
