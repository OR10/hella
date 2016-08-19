<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB\Migrations;
use AppBundle\Model;

class ProjectAvailableExportsDefault implements Migrations\DocumentMigration
{
    public function migrate(array $data)
    {
        if ($data['type'] !== 'AppBundle.Model.Project') {
            return $data;
        }

        if (isset($data['availableExports']) && is_array($data['availableExports'])) {
            return $data;
        }

        $data['availableExports'] = ['legacy'];

        return $data;
    }
}
