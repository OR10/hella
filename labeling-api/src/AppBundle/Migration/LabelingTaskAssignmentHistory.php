<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB\Migrations;
use AppBundle\Model;

class LabelingTaskAssignmentHistory implements Migrations\DocumentMigration
{
    public function migrate(array $data)
    {
        if ($data['type'] !== 'AppBundle.Model.LabelingTask') {
            return $data;
        }

        if (array_key_exists('assignmentHistory', $data)) {
            return $data;
        }

        $data['assignmentHistory']   = array();
        $data['assignmentHistory'][] = array(
            'userId' => $data['assignedUser'],
            'assignedAt' => 1470316280,
            'phase' => Model\LabelingTask::PHASE_LABELING,
            'status' => $data['status'][Model\LabelingTask::PHASE_LABELING],
        );
        unset($data['assignedUser']);

        return $data;
    }
}
