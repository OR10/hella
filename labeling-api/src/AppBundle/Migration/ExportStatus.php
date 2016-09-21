<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB\Migrations;
use AppBundle\Model;

class ExportStatus implements Migrations\DocumentMigration
{
    public function migrate(array $data)
    {
        if ($data['type'] !== 'AppBundle.Model.Export') {
            return $data;
        }

        if (array_key_exists('status', $data)) {
            return $data;
        }

        $data['status'] = Model\Export::EXPORT_STATUS_DONE;

        return $data;
    }
}
