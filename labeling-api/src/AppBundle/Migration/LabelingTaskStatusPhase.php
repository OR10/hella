<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB\Migrations;
use AppBundle\Model;

class LabelingTaskStatusPhase implements Migrations\DocumentMigration
{
    public function migrate(array $data)
    {
        if ($data['type'] !== 'AppBundle.Model.LabelingTask') {
            return $data;
        }

        if (is_array($data['status'])) {
            return $data;
        }

        $data['status'] = array(
            Model\LabelingTask::PHASE_LABELING => $data['status'],
        );

        return $data;
    }
}