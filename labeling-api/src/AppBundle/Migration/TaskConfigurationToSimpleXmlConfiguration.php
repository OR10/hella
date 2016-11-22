<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB\Migrations;
use AppBundle\Model;

class TaskConfigurationToSimpleXmlConfiguration implements Migrations\DocumentMigration
{
    public function migrate(array $data)
    {
        if ($data['type'] !== 'AppBundle.Model.TaskConfiguration') {
            return $data;
        }

        $data['type'] = 'AppBundle.Model.TaskConfiguration.SimpleXml';

        return $data;
    }
}
