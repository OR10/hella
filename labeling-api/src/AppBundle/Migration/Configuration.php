<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB;

class Configuration extends CouchDB\Configuration
{
    public function getMigrations()
    {
        return new Multi(
            array(
                new TaskTimerPhase(),
                new LabelingTaskStatusPhase(),
                new LabelingTaskAssignmentHistory(),
                new LabelingTaskReopenByPhase(),
                new ProjectCoordinatorAssigneeHistory(),
                new ProjectAvailableExportsDefault(),
                new UserLockedState(),
                new ProjectStatusHistory(),
                new ExportStatus(),
                new ProjectExportStatus(),
                new TaskConfigurationToSimpleXmlConfiguration(),
            )
        );
    }
}
