<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB\Migrations;
use AppBundle\Model;

class UserLockedState implements Migrations\DocumentMigration
{
    public function migrate(array $data)
    {
        if ($data['type'] !== 'AppBundle.Model.User') {
            return $data;
        }
        
        if (is_bool($data['locked'])) {
            return $data;
        }

        if ($data['locked'] === '0') {
            $data['locked'] = false;
        }else{
            $data['locked'] = true;
        }

        return $data;
    }
}