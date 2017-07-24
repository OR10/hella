<?php
namespace AnnoStationBundle\Service\ProjectImporter;

use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\ProjectImporter\Facade;
use AnnoStationBundle\Worker\Jobs;
use AppBundle\Model;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;

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
    private $xmlValidatorForImportData;

    /**
     * @var Service\XmlValidator
     */
    private $xmlValidatorForRequirementsConfiguration;

    /**
     * @var Service\TaskCreator
     */
    private $taskCreatorService;

    /**
     * Import constructor.
     *
     * @param Facade\Project         $projectFacade
     * @param Facade\RequirementsXml $requirementsXmlFacade
     * @param Facade\LabelingTask    $labelingTaskFacade
     * @param Facade\Video           $videoFacade
     * @param Service\VideoImporter  $videoImporter
     * @param Service\XmlValidator   $xmlValidatorForImportData
     * @param Service\XmlValidator   $xmlValidatorForRequirementsConfiguration
     * @param Service\TaskCreator    $taskCreatorService
     * @param AMQP\FacadeAMQP        $amqpFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\RequirementsXml $requirementsXmlFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Video $videoFacade,
        Service\VideoImporter $videoImporter,
        Service\XmlValidator $xmlValidatorForImportData,
        Service\XmlValidator $xmlValidatorForRequirementsConfiguration,
        Service\TaskCreator $taskCreatorService,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        $this->projectFacade                            = $projectFacade;
        $this->requirementsXmlFacade                    = $requirementsXmlFacade;
        $this->videoImporter                            = $videoImporter;
        $this->labelingTaskFacade                       = $labelingTaskFacade;
        $this->videoFacade                              = $videoFacade;
        $this->amqpFacade                               = $amqpFacade;
        $this->xmlValidatorForImportData                = $xmlValidatorForImportData;
        $this->taskCreatorService                       = $taskCreatorService;
        $this->xmlValidatorForRequirementsConfiguration = $xmlValidatorForRequirementsConfiguration;
    }

    /**
     * @param                                     $xmlImportFilePath
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     *
     * @return array
     * @throws \Exception
     */
    public function importXml($xmlImportFilePath, AnnoStationBundleModel\Organisation $organisation, Model\User $user)
    {
        $xmlImport = new \DOMDocument();
        $xmlImport->load($xmlImportFilePath);

        $errorMessageForRequirementsConfiguration = $this->xmlValidatorForRequirementsConfiguration->validateRelaxNg(
            $xmlImport
        );
        $errorMessageForImportData                = $this->xmlValidatorForImportData->validateRelaxNg($xmlImport);
        if ($errorMessageForImportData !== null && $errorMessageForRequirementsConfiguration !== null) {
            throw new \Exception(
                sprintf(
                    'The file:\n"%s"\ndoes not match any expected XML Schema\n \nThing Import Error:\n%s\n \nRequirements.xml Configuration File Error:\n%s',
                    basename($xmlImportFilePath),
                    $errorMessageForImportData,
                    $errorMessageForRequirementsConfiguration
                )
            );
        }
        if ($errorMessageForRequirementsConfiguration === null) {
            return [];
        }

        $xpath = new \DOMXPath($xmlImport);
        $xpath->registerNamespace('x', "http://weblabel.hella-aglaia.com/schema/export");

        if ($this->requirementsXml === null) {
            $requirementsXml       = $this->createRequirementsXml($xpath, $xmlImportFilePath, $organisation, $user);
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
        $createdTasks  = [];
        foreach ($videoElements as $videoElement) {
            $video        = $this->createVideo($organisation, $xpath, $videoElement, $project, $xmlImportFilePath);
            $tasks        = $this->taskCreatorService->createTasks($project, $video, $user, true);
            $createdTasks = array_merge($createdTasks, $tasks);

            $job = new Jobs\ThingImporter($xmlImportFilePath, $this->getTasksFrameMapping($tasks));
            $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }

        return $createdTasks;
    }

    /**
     * @param array $tasks
     *
     * @return array
     */
    private function getTasksFrameMapping(array $tasks)
    {
        $taskFrameMapping = [];
        /** @var Model\LabelingTask $task */
        foreach ($tasks as $task) {
            $taskFrameNumberMapping = $task->getFrameNumberMapping();
            $start                  = min($taskFrameNumberMapping);
            $end                    = max($taskFrameNumberMapping);
            $frameRange             = range($start, $end);
            foreach ($frameRange as $frame) {
                $taskFrameMapping[$frame] = $task->getId();
            }
        }

        return $taskFrameMapping;
    }

    /**
     * @param \DOMXPath                               $xpath
     * @param AnnoStationBundleModel\Organisation     $organisation
     * @param                                         $user
     * @param Model\TaskConfiguration\RequirementsXml $requirementsXml
     *
     * @return Model\Project
     */
    private function createProject(
        \DOMXPath $xpath,
        AnnoStationBundleModel\Organisation $organisation,
        $user,
        Model\TaskConfiguration\RequirementsXml $requirementsXml
    ) {

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
     * @param                                     $xmlImportFilePath
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     *
     * @return Model\TaskConfiguration\RequirementsXml
     * @throws \Exception
     */
    private function createRequirementsXml(
        \DOMXPath $xpath,
        $xmlImportFilePath,
        AnnoStationBundleModel\Organisation $organisation,
        Model\User $user
    ) {
        $requirementsElement = $xpath->query('/x:export/x:metadata/x:requirements');

        $filePath = sprintf(
            '%s/%s',
            dirname($xmlImportFilePath),
            $requirementsElement->item(0)->getAttribute('filename')
        );

        $expectedHash = hash('sha256', file_get_contents($filePath));
        $actualHash   = $xpath->query('x:sha256', $requirementsElement->item(0))->item(0)->nodeValue;
        if ($expectedHash !== $actualHash) {
            throw new \Exception(
                sprintf(
                    'Your SHA256 hash:\n"%s"\nfound in file:\n"%s"\ndoes not match the expected hash:\n"%s"\nfor file:\n"%s"',
                    $actualHash,
                    basename($xmlImportFilePath),
                    $expectedHash,
                    basename($filePath)
                )
            );
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
            $requirementsElement->item(0)->getAttribute('filename'),
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
     * @param \DOMXPath                           $xpath
     * @param \DOMElement                         $videoDomElement
     * @param                                     $project
     * @param                                     $xmlImportFilePath
     *
     * @return Model\Video
     * @throws \Exception
     */
    private function createVideo(
        AnnoStationBundleModel\Organisation $organisation,
        \DOMXPath $xpath,
        \DOMElement $videoDomElement,
        $project,
        $xmlImportFilePath
    ) {
        $filename            = $videoDomElement->getAttribute('filename');
        $videoSourcePath     = sprintf('%s/%s', dirname($xmlImportFilePath), $filename);
        $fileInfo            = pathinfo($videoSourcePath);
        $calibrationFilePath = sprintf('%s/%s.csv', dirname($xmlImportFilePath), $fileInfo['filename']);

        $numberOfCuboids = $xpath->query('./x:thing/x:shape/x:cuboid', $videoDomElement)->length;

        if ($numberOfCuboids > 0 && !is_file($calibrationFilePath)) {
            throw new \Exception(
                sprintf(
                    'Missing Video Calibration File:\n"%s"\nfor Video:\n"%s"',
                    basename($calibrationFilePath),
                    $filename
                )
            );
        }

        if (!is_file($videoSourcePath)) {
            throw new \Exception(
                sprintf(
                    'Video File not found:\n"%s"\nreferenced in:\n"%s"',
                    $filename,
                    basename($xmlImportFilePath)
                )
            );
        }

        // Decide between importing an image or a video
        if ($this->isVideoASingleFrameImage($filename)) {
            $video = $this->videoImporter->importImage(
                $organisation,
                $project,
                $filename,
                $videoSourcePath
            );
        } else {
            $video = $this->videoImporter->importVideo(
                $organisation,
                $project,
                $filename,
                $videoSourcePath,
                false
            );
        }

        $video->setOriginalId($videoDomElement->getAttribute('id'));

        if (is_file($calibrationFilePath)) {
            $video->setCalibrationData(
                $this->videoImporter->importCalibrationData($organisation, $project, $calibrationFilePath)
            );
            $this->videoFacade->save($video);
        }

        return $video;
    }

    /**
     * Check if a filename represents a video or a single frame image
     *
     * @param string $filename
     *
     * @return bool
     */
    private function isVideoASingleFrameImage(string $filename): bool
    {
        $fileExtension   = pathinfo($filename, PATHINFO_EXTENSION);
        $imageExtensions = ["png", "jpg", "jpeg"];

        return in_array($fileExtension, $imageExtensions);
    }
}
