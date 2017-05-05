<?php
namespace AnnoStationBundle\Service\ProjectImporter;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service\ProjectImporter\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use crosscan\WorkerPool\AMQP;
use crosscan\WorkerPool;

class Import
{
    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\TaskConfiguration\RequirementsXml
     */
    private $requirementsXml;

    /**
     * @var Model\LabelingTask[]
     */
    private $tasks;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\RequirementsXml
     */
    private $requirementsXmlFacade;

    /**
     * @var Service\VideoImporter
     */
    private $videoImporter;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var Service\XmlValidator
     */
    private $xmlValidator;

    /**
     * Import constructor.
     *
     * @param Facade\Project         $projectFacade
     * @param Facade\RequirementsXml $requirementsXmlFacade
     * @param Facade\LabelingTask    $labelingTaskFacade
     * @param Facade\Video           $videoFacade
     * @param Service\VideoImporter  $videoImporter
     * @param Service\XmlValidator   $xmlValidator
     * @param AMQP\FacadeAMQP        $amqpFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\RequirementsXml $requirementsXmlFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Video $videoFacade,
        Service\VideoImporter $videoImporter,
        Service\XmlValidator $xmlValidator,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        $this->projectFacade         = $projectFacade;
        $this->requirementsXmlFacade = $requirementsXmlFacade;
        $this->videoImporter         = $videoImporter;
        $this->labelingTaskFacade    = $labelingTaskFacade;
        $this->videoFacade           = $videoFacade;
        $this->amqpFacade            = $amqpFacade;
        $this->xmlValidator          = $xmlValidator;
    }

    /**
     * @param                                     $xmlImportFilePath
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     *
     * @return array
     */
    public function importXml($xmlImportFilePath, AnnoStationBundleModel\Organisation $organisation, Model\User $user)
    {
        $xmlImport = new \DOMDocument();
        $xmlImport->load($xmlImportFilePath);

        $errorMessage = $this->xmlValidator->validateRelaxNg($xmlImport);
        if ($errorMessage !== null) {
            return [];
        }

        $xpath = new \DOMXPath($xmlImport);
        $xpath->registerNamespace('x', "http://weblabel.hella-aglaia.com/schema/export");

        if ($this->requirementsXml === null) {
            $requirementsXml = $this->createRequirementsXml($xpath, dirname($xmlImportFilePath), $organisation, $user);
            $this->requirementsXml = $requirementsXml;
        } else {
            $requirementsXml = $this->requirementsXml;
        }

        if ($this->project === null) {
            $project       = $this->createProject($xpath, $organisation, $user, $requirementsXml);
            $this->project = $project;
        } else {
            $project = $this->project;
        }

        $videoElements = $xpath->query('/x:export/x:video');
        $tasks = [];
        foreach ($videoElements as $videoElement) {
            $video = $this->createVideo($organisation, $videoElement, $project, dirname($xmlImportFilePath));
            $tasks = array_merge($this->createTasks($project, $video, $requirementsXml), $tasks);

            $job = new Jobs\ThingImporter($xmlImportFilePath, $this->tasks);
            $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }

        return $tasks;
    }

    /**
     * @param \DOMXPath                               $xpath
     * @param AnnoStationBundleModel\Organisation     $organisation
     * @param                                         $user
     * @param Model\TaskConfiguration\RequirementsXml $requirementsXml
     *
     * @return Model\Project
     */
    private function createProject(\DOMXPath $xpath, AnnoStationBundleModel\Organisation $organisation, $user, Model\TaskConfiguration\RequirementsXml $requirementsXml)
    {

        $projectElement = $xpath->query('/x:export/x:metadata/x:project');

        $project = new Model\Project(
            $projectElement->item(0)->getAttribute('name'),
            $organisation,
            $user,
            null,
            null,
            [],
            $xpath->query('x:frame-skip', $projectElement->item(0))->item(0)->nodeValue,
            $xpath->query('x:start-frame', $projectElement->item(0))->item(0)->nodeValue,
            $xpath->query('x:split-each', $projectElement->item(0))->item(0)->nodeValue,
            $xpath->query('x:description', $projectElement->item(0))->item(0)->nodeValue
        );

        $project->setAvailableExports(['requirementsXml']);
        $project->addRequirementsXmlTaskInstruction(
            Model\LabelingTask::INSTRUCTION_MISCELLANEOUS,
            $requirementsXml->getId()
        );

        $this->projectFacade->save($project);

        return $project;
    }

    /**
     * @param \DOMXPath                           $xpath
     * @param                                     $path
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     *
     * @return Model\TaskConfiguration\RequirementsXml
     * @throws \Exception
     */
    private function createRequirementsXml(
        \DOMXPath $xpath,
        $path,
        AnnoStationBundleModel\Organisation $organisation,
        Model\User $user
    ) {
        $requirementsElement = $xpath->query('/x:export/x:metadata/x:requirements');

        $filePath = sprintf('%s/%s', $path, $requirementsElement->item(0)->getAttribute('filename'));

        $expectedHash = hash('sha256', file_get_contents($filePath));
        $actualHash   = $xpath->query('x:sha256', $requirementsElement->item(0))->item(0)->nodeValue;
        if ($expectedHash !== $actualHash) {
            throw new \Exception('Invalid sha256 hash');
        }

        $requirements = $this->requirementsXmlFacade->getTaskConfigurationByUserAndMd5Hash(
            $organisation,
            $user,
            $requirementsElement->item(0)->getAttribute('name'),
            $requirementsElement->item(0)->getAttribute('filename'),
            $expectedHash
        );

        $requirements = reset($requirements);

        if ($requirements instanceof Model\TaskConfiguration\RequirementsXml) {
            return $requirements;
        }

        $requirements = new Model\TaskConfiguration\RequirementsXml(
            $organisation,
            $requirementsElement->item(0)->getAttribute('name'),
            sprintf('%s.xml', $requirementsElement->item(0)->getAttribute('name')),
            mime_content_type($filePath),
            file_get_contents($filePath),
            $user->getId(),
            \json_encode([])
        );

        $this->requirementsXmlFacade->save($requirements);

        return $requirements;
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param \DOMElement                         $xpath
     * @param                                     $project
     * @param                                     $directory
     *
     * @return Model\Video
     */
    private function createVideo(
        AnnoStationBundleModel\Organisation $organisation,
        \DOMElement $xpath,
        $project,
        $directory
    ) {
        $videoSourcePath = sprintf('%s/%s', $directory, $xpath->getAttribute('filename'));
        $video           = $this->videoImporter->importVideo(
            $organisation,
            $project,
            $xpath->getAttribute('filename'),
            $videoSourcePath,
            false
        );
        $video->setOriginalId($xpath->getAttribute('id'));

        $fileInfo            = pathinfo($videoSourcePath);
        $calibrationFilePath = sprintf('%s/%s.csv', $directory, $fileInfo['filename']);

        if (is_file($calibrationFilePath)) {
            $video->setCalibrationData(
                $this->videoImporter->importCalibrationData($organisation, $project, $calibrationFilePath)
            );
            $this->videoFacade->save($video);
        }

        return $video;
    }

    /**
     * @param Model\Project                           $project
     * @param Model\Video                             $video
     * @param Model\TaskConfiguration\RequirementsXml $requirementsXml
     *
     * @return array
     */
    private function createTasks(
        Model\Project $project,
        Model\Video $video,
        Model\TaskConfiguration\RequirementsXml $requirementsXml
    ) {
        $taskVideoSettings   = $project->getTaskVideoSettings();
        $splitLength         = (int) $taskVideoSettings['splitEach'];
        $frameSkip           = (int) $taskVideoSettings['frameSkip'];
        $startFrameNumber    = (int) $taskVideoSettings['startFrameNumber'];
        $framesPerVideoChunk = $video->getMetaData()->numberOfFrames;
        $frameMappingChunks  = [];
        $videoFrameMapping   = [];
        $drawingToolOptions  = [
            'pedestrian' => [
                'minimalHeight' => 22,
            ],
            'cuboid'     => [
                'minimalHeight' => 15,
            ],
            'polygon'    => [
                'minHandles' => 3,
                'maxHandles' => 15,
            ],
        ];

        if ($video->getMetaData()->numberOfFrames >= ($startFrameNumber + $frameSkip)) {
            $videoFrameMapping = range($startFrameNumber, $video->getMetaData()->numberOfFrames, $frameSkip);
        } elseif ($video->getMetaData()->numberOfFrames >= $startFrameNumber) {
            $videoFrameMapping = [$startFrameNumber];
        }

        if ($splitLength > 0) {
            $framesPerVideoChunk = min($framesPerVideoChunk, round($splitLength * $video->getMetaData()->fps));
        }

        while (count($videoFrameMapping) > 0) {
            $frameMappingChunks[] = array_splice(
                $videoFrameMapping,
                0,
                round($framesPerVideoChunk / $frameSkip)
            );
        }

        $tasks = [];
        foreach ($frameMappingChunks as $frameNumberMapping) {
            $task = new Model\LabelingTask(
                $video,
                $project,
                $frameNumberMapping,
                Model\LabelingTask::TYPE_OBJECT_LABELING,
                null,
                [],
                array_keys($video->getImageTypes()),
                null,
                false,
                $requirementsXml->getId()
            );
            $task->setDrawingToolOptions($drawingToolOptions);
            $task->setLabelInstruction(Model\LabelingTask::INSTRUCTION_MISCELLANEOUS);
            $this->labelingTaskFacade->save($task);
            foreach ($frameNumberMapping as $frameNumber) {
                $this->tasks[$frameNumber] = $task;
            }
            $tasks[] = $task;
        }

        return $tasks;
    }
}