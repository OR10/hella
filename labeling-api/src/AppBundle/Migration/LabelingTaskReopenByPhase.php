<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB\Migrations;
use AppBundle\Model;

class LabelingTaskReopenByPhase implements Migrations\DocumentMigration
{
    public function migrate(array $data)
    {
        if ($data['type'] !== 'AppBundle.Model.LabelingTask') {
            return $data;
        }

        if (is_array($data['reopen'])) {
            return $data;
        }

        $data['reopen'] = array(
            Model\LabelingTask::PHASE_LABELING => $data['reopen'],
            Model\LabelingTask::PHASE_REVIEW => false,
            Model\LabelingTask::PHASE_REVISION => false,
        );

        return $data;
    }
}
