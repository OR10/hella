<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class Project
{
    const STATUS_TODO = 'todo';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_DONE = 'done';

    /**
     * @CouchDB\Id
     */
    private $id;

    /**
     * @CouchDB\Version
     */
    private $rev;

    /**
     * @CouchDB\Field(type="string")
     */
    private $name;

    /**
     * @CouchDB\Field(type="datetime")
     */
    private $creationDate;

    /**
     * @CouchDB\Field(type="datetime")
     */
    private $dueDate;

    /**
     * @CouchDB\Field(type="string")
     */
    private $status = self::STATUS_TODO;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $coordinatorAssignmentHistory = null;

    /**
     * @CouchDB\Field(type="string")
     */
    private $labelingGroupId;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $availableExports = ['legacy'];

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $labelingValidationProcesses = [];

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $taskVideoSettings = [
        'frameSkip'        => 1,
        'startFrameNumber' => 1,
        'splitEach'        => 0,
    ];

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $taskInstructions = [
        'legacy'     => [],
        'genericXml' => [],
    ];

    /**
     * Map basename($video->getName()) => $video->getId()
     *
     * @var string[]
     *
     * @CouchDB\Field(type="mixed")
     */
    private $videos = [];

    /**
     * Map basename($calibrationData->getName()) => $calibrationData->getId()
     *
     * @var string[]
     *
     * @CouchDB\Field(type="mixed")
     */
    private $calibrations = [];

    /**
     * Static factory method for easy use of the fluent interface.
     *
     * @param string $name
     *
     * @param null   $creationDate
     * @param null   $dueDate
     * @param array  $labelingValidationProcesses
     * @param int    $frameSkip
     * @param int    $startFrameNumber
     * @param int    $splitEach
     *
     * @return static
     */
    public static function create(
        $name,
        $creationDate = null,
        $dueDate = null,
        $labelingValidationProcesses = [],
        $frameSkip = 1,
        $startFrameNumber = 0,
        $splitEach = 0
    ) {
        return new static(
            $name,
            $creationDate,
            $dueDate,
            $labelingValidationProcesses,
            $frameSkip,
            $startFrameNumber,
            $splitEach
        );
    }

    /**
     * @param string $name
     * @param null   $creationDate
     * @param null   $dueDate
     * @param array  $labelingValidationProcesses
     * @param int    $frameSkip
     * @param int    $startFrameNumber
     * @param int    $splitEach
     */
    public function __construct(
        $name,
        $creationDate = null,
        $dueDate = null,
        $labelingValidationProcesses = [],
        $frameSkip = 1,
        $startFrameNumber = 0,
        $splitEach = 0
    ) {
        if ($creationDate === null) {
            $creationDate = new \DateTime('now', new \DateTimeZone('UTC'));
        }
        $this->name                                  = (string) $name;
        $this->creationDate                          = $creationDate;
        $this->dueDate                               = $dueDate;
        $this->labelingValidationProcesses           = $labelingValidationProcesses;
        $this->taskVideoSettings['frameSkip']        = (int) $frameSkip;
        $this->taskVideoSettings['startFrameNumber'] = (int) $startFrameNumber;
        $this->taskVideoSettings['splitEach']        = (int) $splitEach;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     *
     * @return Video
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getCreationDate()
    {
        if ($this->creationDate instanceof \DateTime) {
            return $this->creationDate->getTimestamp();
        }

        return null;
    }

    /**
     * @return mixed
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param mixed $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @return mixed
     */
    public function getDueDate()
    {
        if ($this->dueDate instanceof \DateTime) {
            return $this->dueDate->getTimestamp();
        }

        return null;
    }

    /**
     * @return CouchDB\Field
     */
    public function getCoordinatorAssignmentHistory()
    {
        return $this->coordinatorAssignmentHistory;
    }

    /**
     * @param User      $user
     * @param \DateTime $date
     */
    public function addCoordinatorAssignmentHistory(User $user = null, \DateTime $date = null)
    {
        if ($date === null) {
            $date = new \DateTime('now', new \DateTimeZone('UTC'));
        }
        $this->coordinatorAssignmentHistory[] = array(
            'userId'     => $user->getId(),
            'assignedAt' => $date->getTimestamp(),
            'status'     => $this->getStatus(),
        );
    }

    /**
     * @return null
     */
    public function getLatestAssignedCoordinatorUserId()
    {
        $historyEntries = $this->getCoordinatorAssignmentHistory();
        if (empty($historyEntries)) {
            return null;
        }

        usort(
            $historyEntries,
            function ($a, $b) {
                if ($a['assignedAt'] === $b['assignedAt']) {
                    return 0;
                }

                return ($a['assignedAt'] > $b['assignedAt']) ? -1 : 1;
            }
        );

        return $historyEntries[0]['userId'];
    }

    /**
     * @param mixed $creationDate
     */
    public function setCreationDate($creationDate)
    {
        $this->creationDate = $creationDate;
    }

    /**
     * @return mixed
     */
    public function getLabelingGroupId()
    {
        return $this->labelingGroupId;
    }

    /**
     * @param mixed $labelingGroupId
     */
    public function setLabelingGroupId($labelingGroupId)
    {
        $this->labelingGroupId = $labelingGroupId;
    }

    /**
     * @param mixed $availableExports
     */
    public function setAvailableExports($availableExports)
    {
        $this->availableExports = $availableExports;
    }

    /**
     * @return mixed
     */
    public function getAvailableExports()
    {
        return $this->availableExports;
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

    public function hasReviewValidationProcess()
    {
        return in_array('review', $this->labelingValidationProcesses);
    }

    public function hasRevisionValidationProcess()
    {
        return in_array('revision', $this->labelingValidationProcesses);
    }

    /**
     * @return mixed
     */
    public function getTaskVideoSettings()
    {
        return $this->taskVideoSettings;
    }

    /**
     * @param mixed $taskVideoSettings
     */
    public function setTaskVideoSettings($taskVideoSettings)
    {
        $this->taskVideoSettings = $taskVideoSettings;
    }

    /**
     * @return mixed
     */
    public function getLegacyTaskInstructions()
    {
        return $this->taskInstructions['legacy'];
    }

    /**
     * @return mixed
     */
    public function getGenericXmlTaskInstructions()
    {
        return $this->taskInstructions['genericXml'];
    }

    /**
     * @param $instruction
     * @param $drawingTool
     */
    public function addLegacyTaskInstruction($instruction, $drawingTool)
    {
        $this->taskInstructions['legacy'][] = [
            'instruction' => $instruction,
            'drawingTool' => $drawingTool,
        ];
    }

    /**
     * @param $instruction
     * @param $taskConfigurationId
     */
    public function addGenericXmlTaskInstruction($instruction, $taskConfigurationId)
    {
        $this->taskInstructions['genericXml'][] = [
            'instruction'         => $instruction,
            'taskConfigurationId' => $taskConfigurationId,
        ];
    }

    public function hasVideo(string $videoName)
    {
        $videoKey = $this->getVideoKey($videoName);

        return is_array($this->videos) && array_key_exists($videoKey, $this->videos);
    }

    /**
     * @param Video $video
     */
    public function addVideo(Video $video)
    {
        if ($this->hasVideo($video->getName())) {
            throw new \InvalidArgumentException(sprintf('Video already exists: %s', $video->getName()));
        }

        if ($video->getId() === null) {
            throw new \LogicException('Trying to reference a not yet persisted video');
        }

        $this->videos[$this->getVideoKey($video->getName())] = $video->getId();
    }

    /**
     * @return string[]
     */
    public function getVideoIds()
    {
        return $this->videos;
    }

    /**
     * @param string $videoName
     *
     * @return string
     */
    private function getVideoKey(string $videoName)
    {
        return basename($videoName, '.' . pathinfo($videoName, PATHINFO_EXTENSION));
    }

    /**
     * @param string $calibrationDataName
     *
     * @return bool
     */
    public function hasCalibrationData(string $calibrationDataName)
    {
        $videoKey = $this->getVideoKey($calibrationDataName);

        return is_array($this->calibrations) && array_key_exists($videoKey, $this->calibrations);
    }

    /**
     * @param CalibrationData $calibrationData
     */
    public function addCalibrationData(CalibrationData $calibrationData)
    {
        if ($this->hasCalibrationData($calibrationData->getName())) {
            throw new \InvalidArgumentException(
                sprintf('Calibration data already exists: %s', $calibrationData->getName())
            );
        }

        if ($calibrationData->getId() === null) {
            throw new \LogicException('Trying to reference a not yet persisted calibration data');
        }

        $this->calibrations[$this->getVideoKey($calibrationData->getName())] = $calibrationData->getId();
    }

    /**
     * @return string[]
     */
    public function getCalibrations()
    {
        return $this->calibrations;
    }

    /**
     * @param Video $video
     *
     * @return string|null
     */
    public function getCalibrationDataIdForVideo(Video $video)
    {
        $key = $this->getVideoKey($video->getName());

        return isset($this->calibrations[$key]) ? $this->calibrations[$key] : null;
    }
}
