<?php
namespace AnnoStationBundle\Service\ProjectImporter;

use AppBundle\Model;
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
     * Import constructor.
     *
     * @param Facade\Project         $projectFacade
     * @param Facade\RequirementsXml $requirementsXmlFacade
     * @param Facade\LabelingTask    $labelingTaskFacade
     * @param Facade\Video           $videoFacade
     * @param Service\VideoImporter  $videoImporter
     * @param AMQP\FacadeAMQP        $amqpFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\RequirementsXml $requirementsXmlFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Video $videoFacade,
        Service\VideoImporter $videoImporter,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        $this->projectFacade         = $projectFacade;
        $this->requirementsXmlFacade = $requirementsXmlFacade;
        $this->videoImporter         = $videoImporter;
        $this->labelingTaskFacade    = $labelingTaskFacade;
        $this->videoFacade           = $videoFacade;
        $this->amqpFacade            = $amqpFacade;
    }

    /**
     * @param            $xmlImportFilePath
     * @param Model\User $user
     */
    public function importXml($xmlImportFilePath, Model\User $user)
    {
        $xmlImport = new \DOMDocument();
        $xmlImport->load($xmlImportFilePath);

        try {
            $xmlImport->relaxNGValidate(__DIR__ . '/../../Resources/XmlSchema/RequirementsXmlExport.rng');
        } catch (\Exception $exception) {
            // Invalid file, skip
        }
        $xpath = new \DOMXPath($xmlImport);
        $xpath->registerNamespace('x', "http://weblabel.hella-aglaia.com/schema/export");

        if ($this->requirementsXml === null) {
            $requirementsXml       = $this->createRequirementsXml($xpath, dirname($xmlImportFilePath), $user);
            $this->requirementsXml = $requirementsXml;
        } else {
            $requirementsXml = $this->requirementsXml;
        }

        if ($this->project === null) {
            $project       = $this->createProject($xpath, $user, $requirementsXml);
            $this->project = $project;
        } else {
            $project = $this->project;
        }

        $videoElements = $xpath->query('/x:export/x:video');
        foreach ($videoElements as $videoElement) {
            $video = $this->createVideo($videoElement, $project, dirname($xmlImportFilePath));
            $this->createTasks($project, $video, $requirementsXml);

            $job = new Jobs\ThingImporter($xmlImportFilePath, $this->tasks);
            $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }
    }

    /**
     * @param \DOMXPath                               $xpath
     * @param                                         $user
     * @param Model\TaskConfiguration\RequirementsXml $requirementsXml
     *
     * @return Model\Project
     */
    private function createProject(\DOMXPath $xpath, $user, Model\TaskConfiguration\RequirementsXml $requirementsXml)
    {

        $projectElement = $xpath->query('/x:export/x:metadata/x:project');

        $project = new Model\Project(
            $projectElement->item(0)->getAttribute('name'),
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
     * @param \DOMXPath  $xpath
     * @param            $path
     * @param Model\User $user
     *
     * @return Model\TaskConfiguration\RequirementsXml
     * @throws \Exception
     */
    private function createRequirementsXml(\DOMXPath $xpath, $path, Model\User $user)
    {
        $requirementsElement = $xpath->query('/x:export/x:metadata/x:requirements');

        $filePath = sprintf('%s/%s', $path, $requirementsElement->item(0)->getAttribute('filename'));

        $expectedHash = hash('sha256', file_get_contents($filePath));
        $actualHash   = $xpath->query('x:sha256', $requirementsElement->item(0))->item(0)->nodeValue;
        if ($expectedHash !== $actualHash) {
            throw new \Exception('Invalid sha256 hash');
        }

        $requirements = new Model\TaskConfiguration\RequirementsXml(
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
     * @param \DOMElement $xpath
     * @param             $project
     * @param             $directory
     *
     * @return Model\Video
     */
    private function createVideo(\DOMElement $xpath, $project, $directory)
    {
        $videoSourcePath = sprintf('%s/%s', $directory, $xpath->getAttribute('filename'));
        $video           = $this->videoImporter->importVideo(
            $project,
            $xpath->getAttribute('filename'),
            $videoSourcePath,
            false
        );

        $fileInfo            = pathinfo($videoSourcePath);
        $calibrationFilePath = sprintf('%s/%s.csv', $directory, $fileInfo['filename']);

        if (is_file($calibrationFilePath)) {
            $video->setCalibrationData($this->videoImporter->importCalibrationData($project, $calibrationFilePath));
            $this->videoFacade->save($video);
        }

        return $video;
    }

    /**
     * @param Model\Project                           $project
     * @param Model\Video                             $video
     * @param Model\TaskConfiguration\RequirementsXml $requirementsXml
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
        }
    }
}