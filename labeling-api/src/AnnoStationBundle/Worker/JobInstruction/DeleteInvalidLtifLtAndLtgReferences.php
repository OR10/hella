<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;
use crosscan\WorkerPool\Exception;
use Doctrine\ODM\CouchDB;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\LabeledThing;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;
use AnnoStationBundle\Database\Facade\LabeledThingGroup;

class DeleteInvalidLtifLtAndLtgReferences extends WorkerPoolBundle\JobInstruction
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var LabeledThing\FacadeInterface
     */
    private $labeledThingFacadeFactory;

    /**
     * @var LabeledThingInFrame\FacadeInterface
     */
    private $labeledThingInFrameFacadeFactory;

    /**
     * @var LabeledThingGroup\FacadeInterface
     */
    private $labeledThingGroupFacadeFactory;

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @var string
     */
    private $deletedObjectsDir;

    /**
     * @var string
     */
    private $couchDbUser;

    /**
     * @var string
     */
    private $couchDbPassword;

    /**
     * @var string
     */
    private $couchDbHost;

    /**
     * @var string
     */
    private $couchDbPort;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        LabeledThing\FacadeInterface $labeledThingFacadeFactory,
        LabeledThingInFrame\FacadeInterface $labeledThingInFrameFacadeFactory,
        LabeledThingGroup\FacadeInterface $labeledThingGroupFacadeFactory,
        CouchDB\DocumentManager $documentManager,
        $deletedObjectsDir,
        $couchDbUser,
        $couchDbPassword,
        $couchDbHost,
        $couchDbPort
    ) {
        $this->labelingTaskFacade               = $labelingTaskFacade;
        $this->labeledThingFacadeFactory        = $labeledThingFacadeFactory;
        $this->labeledThingInFrameFacadeFactory = $labeledThingInFrameFacadeFactory;
        $this->labeledThingGroupFacadeFactory   = $labeledThingGroupFacadeFactory;
        $this->documentManager                  = $documentManager;
        $this->deletedObjectsDir                = $deletedObjectsDir;
        $this->couchDbUser                      = $couchDbUser;
        $this->couchDbPassword                  = $couchDbPassword;
        $this->couchDbHost                      = $couchDbHost;
        $this->couchDbPort                      = $couchDbPort;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     *
     * @throws Exception\Recoverable
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade)
    {
        $task = $this->labelingTaskFacade->find($job->getTaskId());

        $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );
        $labeledThingFacade        = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        $labeledThings        = $labeledThingFacade->findByTaskId($task);
        $this->removeInvalidLabeledThingGroupReferences(
            $task,
            $labeledThings
        );

        $labeledThingsInFrames        = $labeledThingInFrameFacade->getLabeledThingsInFrame($task);
        $invalidLabeledThingsInFrames = $this->getInvalidLabeledThingReferencesFromLabeledThingInFrames(
            $labeledThingsInFrames,
            $task->getProjectId(),
            $task->getId()
        );

        $this->removeLabeledThingWithoutAnyLabeledThingInFrameRelation(
            $labeledThings,
            $task
        );

        $this->deleteLabeledThingInFrames(
            $invalidLabeledThingsInFrames
        );
        $this->detachObjects($labeledThings);
        $this->detachObjects($labeledThingsInFrames);
        $this->documentManager->detach($task);
        $this->documentManager->clear();
    }

    /**
     * @param                    $labeledThings
     * @param Model\LabelingTask $task
     */
    private
    function removeLabeledThingWithoutAnyLabeledThingInFrameRelation(
        $labeledThings,
        Model\LabelingTask $task
    ) {
        $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        foreach ($labeledThings as $labeledThing) {
            if (empty($labeledThingFacade->getLabeledThingInFrames($labeledThing))) {
                $this->backupAndLogDocument($labeledThing);
                $labeledThingFacade->delete($labeledThing);
            }
        }
    }

    /**
     * @param Model\LabelingTask   $task
     * @param Model\LabeledThing[] $labeledThings
     *
     * @return int
     */
    private function removeInvalidLabeledThingGroupReferences(
        Model\LabelingTask $task,
        $labeledThings
    ) {
        $labeledThingGroupFacade   = $this->labeledThingGroupFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );
        $labeledThingFacade        = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );
        foreach ($labeledThings as $labeledThing) {
            $newGroup = $labeledThing->getGroupIds();
            foreach ($labeledThing->getGroupIds() as $groupId) {

                if (!$labeledThingGroupFacade->find($groupId) instanceof AnnoStationBundleModel\LabeledThingGroup) {
                    $this->backupAndLogDocument($labeledThing);
                    $key = array_search($groupId, $newGroup);
                    unset($newGroup[$key]);
                }
            }
            $labeledThing->setGroupIds($newGroup);
            $labeledThingFacade->save($labeledThing);
        }
    }

    /**
     * @param Model\LabeledThingInFrame[] $labeledThingsInFrames
     * @param                             $projectId
     * @param                             $taskId
     *
     * @return array
     */
    private function getInvalidLabeledThingReferencesFromLabeledThingInFrames(
        $labeledThingsInFrames,
        $projectId,
        $taskId
    ) {
        $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $projectId,
            $taskId
        );

        $invalidLabeledThingInFrames = [];
        foreach ($labeledThingsInFrames as $labeledThingsInFrame) {
            $labeledThing = $labeledThingFacade->find($labeledThingsInFrame->getLabeledThingId());
            if ($labeledThing === null) {
                $invalidLabeledThingInFrames[] = $labeledThingsInFrame;
            } else {
                $this->documentManager->detach($labeledThing);
            }
        }

        return $invalidLabeledThingInFrames;
    }

    /**
     * @param Model\LabeledThingInFrame[] $labeledThingInFrames
     */
    private function deleteLabeledThingInFrames(
        $labeledThingInFrames
    ) {
        foreach ($labeledThingInFrames as $labeledThingInFrame) {
            $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
                $labeledThingInFrame->getProjectId(),
                $labeledThingInFrame->getTaskId()
            );
            $this->backupAndLogDocument($labeledThingInFrame);
            $labeledThingInFrameFacade->delete([$labeledThingInFrame]);
        }
    }

    /**
     * @param Model\LabeledThing|Model\LabeledThingInFrame|Model\LabelingGroup $object
     */
    private function backupAndLogDocument(
        $object
    ) {
        file_put_contents(
            sprintf(
                '%s/files/%s.json',
                $this->deletedObjectsDir,
                $object->getId()
            ),
            $this->getRawDocument($object->getProjectId(), $object->getTaskId(), $object->getId())
        );
        $this->logId($object->getId(), $object->getProjectId(), $object->getTaskId());
    }

    /**
     * @param $projectId
     * @param $taskId
     * @param $documentId
     *
     * @return bool|string
     */
    private function getRawDocument(
        $projectId,
        $taskId,
        $documentId
    ) {
        return file_get_contents(
            sprintf(
                'http://%s:%s@%s:%s/taskdb-project-%s-task-%s/%s',
                $this->couchDbUser,
                $this->couchDbPassword,
                $this->couchDbHost,
                $this->couchDbPort,
                $projectId,
                $taskId,
                $documentId
            )
        );
    }

    /**
     * @param $id
     * @param $projectId
     * @param $taskId
     */
    private function logId(
        $id,
        $projectId,
        $taskId
    ) {
        $date = new \DateTime('now', new \DateTimeZone('UTC'));
        $logFilePath = sprintf(
            '%s/logs/%s-project-%s-task-%s',
            $this->deletedObjectsDir,
            $date->format('Y-m-d'),
            $projectId,
            $taskId
        );

        if (!is_file($logFilePath)) {
            file_put_contents(
                $logFilePath,
                "date;id;projectId;taskId\n"
            );
        }

        file_put_contents(
            $logFilePath,
            sprintf(
                "%s;%s;%s;%s%s",
                $date->format('c'),
                $id,
                $projectId,
                $taskId,
                "\n"
            ),
            FILE_APPEND
        );
    }

    /**
     * @param $objects
     */
    private function detachObjects(
        $objects
    ) {
        foreach ($objects as $object) {
            $this->documentManager->detach($object);
        }
        $this->documentManager->clear();
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(
        WorkerPool\Job $job
    ) {
        return $job instanceof Jobs\DeleteInvalidLtifLtAndLtgReferences;
    }
}
