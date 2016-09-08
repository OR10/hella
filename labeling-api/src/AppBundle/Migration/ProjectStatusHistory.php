<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB\Migrations;
use AppBundle\Model;

class ProjectStatusHistory implements Migrations\DocumentMigration
{
    public function migrate(array $data)
    {
        if ($data['type'] !== 'AppBundle.Model.Project') {
            return $data;
        }

        if (is_array($data)) {
            return $data;
        }

        $data['status']   = array();
        $data['status'][] = array(
            'userId' => null,
            'assignedAt' => 1473332004,
            'status' => $data['status'],
        );

        return $data;
    }
}
