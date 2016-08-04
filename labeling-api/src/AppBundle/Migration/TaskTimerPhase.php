<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB\Migrations;
use AppBundle\Model;

class TaskTimerPhase implements Migrations\DocumentMigration
{
    public function migrate(array $data)
    {
        if ($data['type'] !== 'AppBundle.Model.TaskTimer') {
            return $data;
        }

        if (is_array($data['timeInSeconds'])) {
            return $data;
        }

        $data['timeInSeconds'] = array(
            Model\LabelingTask::PHASE_LABELING => $data['timeInSeconds'],
            Model\LabelingTask::PHASE_REVIEW => 0,
            Model\LabelingTask::PHASE_REVISION => 0,
        );

        return $data;
    }
}