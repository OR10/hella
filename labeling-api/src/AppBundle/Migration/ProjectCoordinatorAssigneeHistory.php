<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB\Migrations;
use AppBundle\Model;

class ProjectCoordinatorAssigneeHistory implements Migrations\DocumentMigration
{
    public function migrate(array $data)
    {
        if ($data['type'] !== 'AppBundle.Model.Project') {
            return $data;
        }

        if (array_key_exists('coordinatorAssignmentHistory', $data)) {
            return $data;
        }

        $data['coordinatorAssignmentHistory']   = array();
        $data['coordinatorAssignmentHistory'][] = array(
            'userId' => isset($data['coordinator']) ? $data['coordinator'] : null,
            'assignedAt' => 1470644479,
            'status' => $data['status'],
        );
        unset($data['coordinator']);

        return $data;
    }
}
