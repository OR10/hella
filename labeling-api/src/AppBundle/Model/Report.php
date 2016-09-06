<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class Report
{
    const REPORT_STATUS_IN_PROGRESS = 'in_progress';
    const REPORT_STATUS_DONE = 'done';

    /**
     * @CouchDB\Id
     */
    private $id;

    /**
     * @CouchDB\Version
     */
    private $rev;

    /**
     * @CouchDB\Field(type="datetime")
     */
    private $reportCreationDate;

    /**
     * @CouchDB\Field(type="string")
     */
    private $reportStatus = self::REPORT_STATUS_IN_PROGRESS;

    /**
     * @CouchDB\Field(type="string")
     */
    private $projectId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $projectStatus;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $projectCreatedAt;

    /**
     * @CouchDB\Field(type="string")
     */
    private $projectCreatedBy;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $projectMovedToInProgressAt;

    /**
     * @CouchDB\Field(type="string")
     */
    private $projectMovedToInProgressBy;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $projectMovedToDoneAt;

    /**
     * @CouchDB\Field(type="string")
     */
    private $projectMovedToDoneBy;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfVideosInProject;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfTasksInProject;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $labelingValidationProcesses;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $projectDueDate;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfToDoTasks;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfInProgressTasks;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfDoneTasks;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfToDoReviewTasks;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfInProgressReviewTasks;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfDoneReviewTasks;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfToDoRevisionTasks;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfInProgressRevisionTasks;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfDoneRevisionTasks;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfLabeledThingInFrames;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfLabeledThingInFrameClasses;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfLabeledThings;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $numberOfLabeledThingClasses;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $totalTime;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $totalLabelingTime;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $totalReviewTime;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $totalRevisionTime;

    public function __construct(Project $project, $creationDate)
    {
        if ($creationDate === null) {
            $creationDate = new \DateTime('now', new \DateTimeZone('UTC'));
        }
        $this->projectId = $project->getId();
        $this->reportCreationDate = $creationDate;
    }

    /**
     * @param Project $project
     * @param null    $creationDate
     * @return static
     */
    public static function create(Project $project, $creationDate = null)
    {
        return new static($project, $creationDate);
    }

    /**
     * @return mixed
     */
    public function getProjectCreatedAt()
    {
        return $this->projectCreatedAt;
    }

    /**
     * @param mixed $projectCreatedAt
     */
    public function setProjectCreatedAt($projectCreatedAt)
    {
        $this->projectCreatedAt = $projectCreatedAt;
    }

    /**
     * @return mixed
     */
    public function getProjectMovedToInProgressAt()
    {
        return $this->projectMovedToInProgressAt;
    }

    /**
     * @param mixed $projectMovedToInProgressAt
     */
    public function setProjectMovedToInProgressAt($projectMovedToInProgressAt)
    {
        $this->projectMovedToInProgressAt = $projectMovedToInProgressAt;
    }

    /**
     * @return mixed
     */
    public function getProjectMovedToDoneAt()
    {
        return $this->projectMovedToDoneAt;
    }

    /**
     * @param mixed $projectMovedToDoneAt
     */
    public function setProjectMovedToDoneAt($projectMovedToDoneAt)
    {
        $this->projectMovedToDoneAt = $projectMovedToDoneAt;
    }

    /**
     * @return mixed
     */
    public function getNumberOfVideosInProject()
    {
        return $this->numberOfVideosInProject;
    }

    /**
     * @param mixed $numberOfVideosInProject
     */
    public function setNumberOfVideosInProject($numberOfVideosInProject)
    {
        $this->numberOfVideosInProject = $numberOfVideosInProject;
    }

    /**
     * @return mixed
     */
    public function getNumberOfTasksInProject()
    {
        return $this->numberOfTasksInProject;
    }

    /**
     * @param mixed $numberOfTasksInProject
     */
    public function setNumberOfTasksInProject($numberOfTasksInProject)
    {
        $this->numberOfTasksInProject = $numberOfTasksInProject;
    }

    /**
     * @return mixed
     */
    public function getLabelingValidationProcesses()
    {
        return $this->labelingValidationProcesses;
    }

    /**
     * @param mixed $labelingValidationProcesses
     */
    public function setLabelingValidationProcesses($labelingValidationProcesses)
    {
        $this->labelingValidationProcesses = $labelingValidationProcesses;
    }

    /**
     * @return mixed
     */
    public function getProjectDueDate()
    {
        return $this->projectDueDate;
    }

    /**
     * @param mixed $projectDueDate
     */
    public function setProjectDueDate($projectDueDate)
    {
        $this->projectDueDate = $projectDueDate;
    }

    /**
     * @return mixed
     */
    public function getNumberOfToDoTasks()
    {
        return $this->numberOfToDoTasks;
    }

    /**
     * @param mixed $numberOfToDoTasks
     */
    public function setNumberOfToDoTasks($numberOfToDoTasks)
    {
        $this->numberOfToDoTasks = $numberOfToDoTasks;
    }

    /**
     * @return mixed
     */
    public function getNumberOfInProgressTasks()
    {
        return $this->numberOfInProgressTasks;
    }

    /**
     * @param mixed $numberOfInProgressTasks
     */
    public function setNumberOfInProgressTasks($numberOfInProgressTasks)
    {
        $this->numberOfInProgressTasks = $numberOfInProgressTasks;
    }

    /**
     * @return mixed
     */
    public function getNumberOfDoneTasks()
    {
        return $this->numberOfDoneTasks;
    }

    /**
     * @param mixed $numberOfDoneTasks
     */
    public function setNumberOfDoneTasks($numberOfDoneTasks)
    {
        $this->numberOfDoneTasks = $numberOfDoneTasks;
    }

    /**
     * @return mixed
     */
    public function getNumberOfToDoReviewTasks()
    {
        return $this->numberOfToDoReviewTasks;
    }

    /**
     * @param mixed $numberOfToDoReviewTasks
     */
    public function setNumberOfToDoReviewTasks($numberOfToDoReviewTasks)
    {
        $this->numberOfToDoReviewTasks = $numberOfToDoReviewTasks;
    }

    /**
     * @return mixed
     */
    public function getNumberOfInProgressReviewTasks()
    {
        return $this->numberOfInProgressReviewTasks;
    }

    /**
     * @param mixed $numberOfInProgressReviewTasks
     */
    public function setNumberOfInProgressReviewTasks($numberOfInProgressReviewTasks)
    {
        $this->numberOfInProgressReviewTasks = $numberOfInProgressReviewTasks;
    }

    /**
     * @return mixed
     */
    public function getNumberOfDoneReviewTasks()
    {
        return $this->numberOfDoneReviewTasks;
    }

    /**
     * @param mixed $numberOfDoneReviewTasks
     */
    public function setNumberOfDoneReviewTasks($numberOfDoneReviewTasks)
    {
        $this->numberOfDoneReviewTasks = $numberOfDoneReviewTasks;
    }

    /**
     * @return mixed
     */
    public function getNumberOfToDoRevisionTasks()
    {
        return $this->numberOfToDoRevisionTasks;
    }

    /**
     * @param mixed $numberOfToDoRevisionTasks
     */
    public function setNumberOfToDoRevisionTasks($numberOfToDoRevisionTasks)
    {
        $this->numberOfToDoRevisionTasks = $numberOfToDoRevisionTasks;
    }

    /**
     * @return mixed
     */
    public function getNumberOfInProgressRevisionTasks()
    {
        return $this->numberOfInProgressRevisionTasks;
    }

    /**
     * @param mixed $numberOfInProgressRevisionTasks
     */
    public function setNumberOfInProgressRevisionTasks($numberOfInProgressRevisionTasks)
    {
        $this->numberOfInProgressRevisionTasks = $numberOfInProgressRevisionTasks;
    }

    /**
     * @return mixed
     */
    public function getNumberOfDoneRevisionTasks()
    {
        return $this->numberOfDoneRevisionTasks;
    }

    /**
     * @param mixed $numberOfDoneRevisionTasks
     */
    public function setNumberOfDoneRevisionTasks($numberOfDoneRevisionTasks)
    {
        $this->numberOfDoneRevisionTasks = $numberOfDoneRevisionTasks;
    }

    /**
     * @return mixed
     */
    public function getNumberOfLabeledThingInFrames()
    {
        return $this->numberOfLabeledThingInFrames;
    }

    /**
     * @param mixed $numberOfLabeledThingInFrames
     */
    public function setNumberOfLabeledThingInFrames($numberOfLabeledThingInFrames)
    {
        $this->numberOfLabeledThingInFrames = $numberOfLabeledThingInFrames;
    }

    /**
     * @return mixed
     */
    public function getNumberOfLabeledThingInFrameClasses()
    {
        return $this->numberOfLabeledThingInFrameClasses;
    }

    /**
     * @param mixed $numberOfLabeledThingInFrameClasses
     */
    public function setNumberOfLabeledThingInFrameClasses($numberOfLabeledThingInFrameClasses)
    {
        $this->numberOfLabeledThingInFrameClasses = $numberOfLabeledThingInFrameClasses;
    }

    /**
     * @return mixed
     */
    public function getNumberOfLabeledThings()
    {
        return $this->numberOfLabeledThings;
    }

    /**
     * @param mixed $numberOfLabeledThings
     */
    public function setNumberOfLabeledThings($numberOfLabeledThings)
    {
        $this->numberOfLabeledThings = $numberOfLabeledThings;
    }

    /**
     * @return mixed
     */
    public function getNumberOfLabeledThingClasses()
    {
        return $this->numberOfLabeledThingClasses;
    }

    /**
     * @param mixed $numberOfLabeledThingClasses
     */
    public function setNumberOfLabeledThingClasses($numberOfLabeledThingClasses)
    {
        $this->numberOfLabeledThingClasses = $numberOfLabeledThingClasses;
    }

    /**
     * @return mixed
     */
    public function getTotalTime()
    {
        return $this->totalTime;
    }

    /**
     * @param mixed $totalTime
     */
    public function setTotalTime($totalTime)
    {
        $this->totalTime = $totalTime;
    }

    /**
     * @return mixed
     */
    public function getTotalLabelingTime()
    {
        return $this->totalLabelingTime;
    }

    /**
     * @param mixed $totalLabelingTime
     */
    public function setTotalLabelingTime($totalLabelingTime)
    {
        $this->totalLabelingTime = $totalLabelingTime;
    }

    /**
     * @return mixed
     */
    public function getTotalReviewTime()
    {
        return $this->totalReviewTime;
    }

    /**
     * @param mixed $totalReviewTime
     */
    public function setTotalReviewTime($totalReviewTime)
    {
        $this->totalReviewTime = $totalReviewTime;
    }

    /**
     * @return mixed
     */
    public function getTotalRevisionTime()
    {
        return $this->totalRevisionTime;
    }

    /**
     * @param mixed $totalRevisionTime
     */
    public function setTotalRevisionTime($totalRevisionTime)
    {
        $this->totalRevisionTime = $totalRevisionTime;
    }

    /**
     * @return mixed
     */
    public function getProjectStatus()
    {
        return $this->projectStatus;
    }

    /**
     * @param mixed $projectStatus
     */
    public function setProjectStatus($projectStatus)
    {
        $this->projectStatus = $projectStatus;
    }

    /**
     * @return mixed
     */
    public function getReportStatus()
    {
        return $this->reportStatus;
    }

    /**
     * @param mixed $reportStatus
     */
    public function setReportStatus($reportStatus)
    {
        $this->reportStatus = $reportStatus;
    }

    /**
     * @return mixed
     */
    public function getProjectId()
    {
        return $this->projectId;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getReportCreationDate()
    {
        return $this->reportCreationDate->getTimestamp();
    }

    /**
     * @return mixed
     */
    public function getProjectMovedToDoneBy()
    {
        return $this->projectMovedToDoneBy;
    }

    /**
     * @return mixed
     */
    public function getProjectMovedToInProgressBy()
    {
        return $this->projectMovedToInProgressBy;
    }

    /**
     * @return mixed
     */
    public function getProjectCreatedBy()
    {
        return $this->projectCreatedBy;
    }

    /**
     * @param mixed $projectCreatedBy
     */
    public function setProjectCreatedBy($projectCreatedBy)
    {
        $this->projectCreatedBy = $projectCreatedBy;
    }
}
