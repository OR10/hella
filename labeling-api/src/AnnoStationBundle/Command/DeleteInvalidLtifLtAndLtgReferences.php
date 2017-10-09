<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use AnnoStationBundle\Database\Facade\LabeledThing;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;
use AnnoStationBundle\Database\Facade\LabeledThingGroup;
use Doctrine\ODM\CouchDB;

class DeleteInvalidLtifLtAndLtgReferences extends Base
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
        parent::__construct();
        $this->labelingTaskFacade               = $labelingTaskFacade;
        $this->labeledThingInFrameFacadeFactory = $labeledThingInFrameFacadeFactory;
        $this->labeledThingFacadeFactory        = $labeledThingFacadeFactory;
        $this->labeledThingGroupFacadeFactory   = $labeledThingGroupFacadeFactory;
        $this->documentManager                  = $documentManager;
        $this->deletedObjectsDir                = $deletedObjectsDir;
        $this->couchDbUser                      = $couchDbUser;
        $this->couchDbPassword                  = $couchDbPassword;
        $this->couchDbHost                      = $couchDbHost;
        $this->couchDbPort                      = $couchDbPort;
    }

    protected function configure()
    {
        $this->setName('annostation:delete-invalid-ltif-lt-and-ltg-references')
            ->setDescription('Delete all LTIF with an invalid LT reference and LT with an invalid LTG OR no assigned LTIF reference')
            ->addArgument('taskId', InputArgument::OPTIONAL)
            ->addOption('dryRun');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $dryRun               = $input->getOption('dryRun');
        $deletedLtifDocs      = 0;
        $deletedLtgReferences = 0;
        $deletedLtDocs        = 0;

        if ($input->getArgument('taskId') !== null) {
            $tasks = [$this->labelingTaskFacade->find($input->getArgument('taskId'))];
        } else {
            $tasks = $this->labelingTaskFacade->findAll();
        }

        $progressBar          = new ProgressBar($output, count($tasks));
        $progressBar->setFormatDefinition(
            'custom',
            ' Scanning Task %current% of %max% Tasks -- [Deleted LTIFs: %deletedDocs%] [Deleted LTs: %deletedLtDocs%] [Deleted LTG References: %deletedLtgReferences%] [TaskId: %currentTask%]'
        );
        $progressBar->setFormat('custom');
        $progressBar->setMessage($deletedLtifDocs, 'deletedDocs');
        $progressBar->setMessage($deletedLtgReferences, 'deletedLtgReferences');
        $progressBar->setMessage($deletedLtDocs, 'deletedLtDocs');
        foreach ($tasks as $task) {
        $progressBar->setMessage($task->getId(), 'currentTask');
            $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
                $task->getProjectId(),
                $task->getId()
            );
            $labeledThingFacade        = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
                $task->getProjectId(),
                $task->getId()
            );

            $labeledThings        = $labeledThingFacade->findByTaskId($task);
            $deletedLtgReferences += $this->removeInvalidLabeledThingGroupReferences(
                $task,
                $labeledThings,
                $dryRun
            );

            $labeledThingsInFrames        = $labeledThingInFrameFacade->getLabeledThingsInFrame($task);
            $invalidLabeledThingsInFrames = $this->getInvalidLabeledThingReferencesFromLabeledThingInFrames(
                $labeledThingsInFrames,
                $task->getProjectId(),
                $task->getId()
            );

            $deletedLtDocs += $this->removeLabeledThingWithoutAnyLabeledThingInFrameRelation(
                $labeledThings,
                $task,
                $dryRun
            );

            $this->deleteLabeledThingInFrames(
                $invalidLabeledThingsInFrames,
                $dryRun
            );
            $deletedLtifDocs += count($invalidLabeledThingsInFrames);
            $progressBar->setMessage($deletedLtifDocs, 'deletedLtifDocs');
            $progressBar->setMessage($deletedLtgReferences, 'deletedLtgReferences');
            $progressBar->setMessage($deletedLtDocs, 'deletedLtDocs');
            $progressBar->advance();
            $this->detachObjects($labeledThings);
            $this->detachObjects($labeledThingsInFrames);
            $this->documentManager->detach($task);
            $this->documentManager->clear();
        }
    }

    /**
     * @param                    $labeledThings
     * @param Model\LabelingTask $task
     * @param                    $dryRun
     * @return int
     */
    private function removeLabeledThingWithoutAnyLabeledThingInFrameRelation(
      $labeledThings,
      Model\LabelingTask $task,
      $dryRun
    ){
        $labeledThingFacade        = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        $removedLabeledThings = 0;
        foreach($labeledThings as $labeledThing) {
            if (empty($labeledThingFacade->getLabeledThingInFrames($labeledThing))) {
                $removedLabeledThings++;
                if (!$dryRun) {
                    $this->backupAndLogDocument($labeledThing);
                    $labeledThingFacade->delete($labeledThing);
                }
            }
        }

        return $removedLabeledThings;
    }

    /**
     * @param Model\LabelingTask   $task
     * @param Model\LabeledThing[] $labeledThings
     * @param                      $dryRun
     * @return int
     */
    private function removeInvalidLabeledThingGroupReferences(
        Model\LabelingTask $task,
        $labeledThings,
        $dryRun
    ) {
        $labeledThingGroupFacade   = $this->labeledThingGroupFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );
        $labeledThingFacade        = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );
        $numberOfDeletedReferences = 0;
        foreach ($labeledThings as $labeledThing) {
            $newGroup = $labeledThing->getGroupIds();
            foreach ($labeledThing->getGroupIds() as $groupId) {

                if (!$labeledThingGroupFacade->find($groupId) instanceof AnnoStationBundleModel\LabeledThingGroup) {
                    $this->backupAndLogDocument($labeledThing);
                    $key = array_search($groupId, $newGroup);
                    unset($newGroup[$key]);
                    $numberOfDeletedReferences++;
                }
            }
            $labeledThing->setGroupIds($newGroup);
            if (!$dryRun) {
                $labeledThingFacade->save($labeledThing);
            }
        }

        return $numberOfDeletedReferences;
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
     * @param                             $dryRun
     */
    private function deleteLabeledThingInFrames($labeledThingInFrames, $dryRun)
    {
        foreach ($labeledThingInFrames as $labeledThingInFrame) {
            $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
                $labeledThingInFrame->getProjectId(),
                $labeledThingInFrame->getTaskId()
            );
            if (!$dryRun) {
                $this->backupAndLogDocument($labeledThingInFrame);
                $labeledThingInFrameFacade->delete([$labeledThingInFrame]);
            }
        }
    }

    /**
     * @param Model\LabeledThing|Model\LabeledThingInFrame|Model\LabelingGroup $object
     */
    private function backupAndLogDocument($object)
    {
        file_put_contents(
            sprintf(
                '%s/%s.json',
                $this->getDirectoryPath($object->getProjectId(), $object->getTaskId()),
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
    private function getRawDocument($projectId, $taskId, $documentId)
    {
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
     * @param $projectId
     * @param $taskId
     *
     * @return string
     */
    private function getDirectoryPath($projectId, $taskId)
    {
        $date = new \DateTime('now', new \DateTimeZone('UTC'));

        $directoryPathName = sprintf(
            '%s/files/%s-project-%s-task-%s',
            $this->deletedObjectsDir,
            $date->format('d-m-Y'),
            $projectId,
            $taskId
        );

        if (!is_dir($directoryPathName)) {
            mkdir($directoryPathName);
        }

        return $directoryPathName;
    }

    /**
     * @param $id
     * @param $projectId
     * @param $taskId
     */
    private function logId($id, $projectId, $taskId)
    {
        $date = new \DateTime('now', new \DateTimeZone('UTC'));
        $file = $this->deletedObjectsDir . '/logs/deleted.txt';
        if (!is_file($file)) {
            file_put_contents(
                $file,
                "date;id;projectId;taskId\n"
            );
        }
        file_put_contents(
            $file,
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
    private function detachObjects($objects)
    {
        foreach($objects as $object) {
            $this->documentManager->detach($object);
        }
        $this->documentManager->clear();
    }
}