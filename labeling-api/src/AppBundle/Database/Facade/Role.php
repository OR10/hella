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
     * @param string $label
     * @param array  $permissions
     * @param bool   $systemRole
     *
     * @return Model\Role
     */
    public function createRole(string $projectId, string $label, array $permissions, bool $systemRole = false)
    {
        $role = new Model\Role($this->uuidGenerator->generateUuid(), $projectId, $label, $permissions, $systemRole);
        $this->documentManager->persist($role);
        $this->documentManager->flush();

        return $role;
    }

    /**
     * @param string[] $roleIds
     *
     * @return Model\Role[]
     */
    public function getRolesByIds(array $roleIds)
    {
        $result = [];
        foreach ($roleIds as $roleId) {
            $result[] = $this->getRoleById($roleId);
        }

        return $result;
    }

    /**
     * @param string $roleId
     *
     * @return Model\User[]
     */
    public function getAllUserForRole(string $roleId)
    {
        return $this->documentManager->createQuery('annostation_roles', 'users_by_role')
            ->onlyDocs(true)
            ->setStartKey($roleId)
            ->setEndKey($roleId)
            ->execute()
            ->toArray();
    }

    /**
     * @param string $projectId
     *
     * @return Model\Role
     */
    public function getRolesForProject(string $projectId)
    {
        $roles = $this->documentManager->createQuery('annostation_roles', 'roles_by_project')
            ->onlyDocs(true)
            ->setStartKey($projectId)
            ->setEndKey($projectId)
            ->execute()
            ->toArray();

        return $roles;
    }

    /**
     * @param string $roleId
     *
     * @return Model\Role
     */
    public function getRoleById(string $roleId)
    {
        return $this->documentManager->find(Model\Role::class, $roleId);
    }

    /**
     * @param string $roleId
     *
     * @return \string[]
     */
    public function getPermissionsForRole(string $roleId)
    {
        return $this->getRoleById($roleId)->getPermissions();
    }

    /**
     * @param Model\Role $role
     */
    public function saveRole(Model\Role $role)
    {
        $this->documentManager->persist($role);
        $this->documentManager->flush();
    }

    /**
     * @param Model\Role $removedRole
     */
    public function deleteRole(Model\Role $removedRole)
    {
        $this->documentManager->remove($removedRole);
        $this->documentManager->flush();
    }

}
