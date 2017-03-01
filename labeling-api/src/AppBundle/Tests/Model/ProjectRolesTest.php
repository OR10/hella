<?php

namespace AppBundle\Tests\Model;

use AppBundle\Model\ProjectRoles;
use AppBundle\Model\Role;

class ProjectRolesTest extends \PHPUnit_Framework_TestCase
{

    public function testAddRoleIsUnique()
    {
        $projectRoles = new ProjectRoles(1);
        $role1        = new Role(1, 1, 1, 1);
        $role2        = new Role(1, 1, 1, 1);
        $projectRoles->assignRole($role1);
        $projectRoles->assignRole($role2);

        $this->assertEquals([$role1->getId() => $role1], $projectRoles->getRoles());
    }

    public function testSetRolesIsUnique()
    {
        $projectRoles = new ProjectRoles(1);
        $role1        = new Role(1, 1, 1, 1);
        $role2        = new Role(1, 1, 1, 1);
        $projectRoles->setRoles([$role1, $role2]);

        $this->assertEquals([$role1->getId() => $role1], $projectRoles->getRoles());
    }

    public function testAddRemovedRolesIsNotUnique()
    {
        $projectRoles = new ProjectRoles(1);
        $role1        = new Role(1, 1, 1, 1);
        $role2        = new Role(1, 1, 1, 1);

        $this->assertEquals([], $projectRoles->getRemovedRoles());

        $projectRoles->addRemovedRole($role1);
        $projectRoles->addRemovedRole($role2);
        $projectRoles->addRemovedRole($role1);

        $this->assertEquals([$role1, $role2, $role1], $projectRoles->getRemovedRoles());

        $projectRoles->clearRemovedRoles();

        $this->assertEquals([], $projectRoles->getRemovedRoles());
    }

}
