<?php
namespace AnnoStationBundle\Service\Exporter;

use AppBundle\Model;
use AppBundle\Database\Facade as AppBundleFacade;
use AppBundle\Service as AppBundleService;
use AnnoStationBundle\Helper\Iterator;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\LabelingTask;
use AnnoStationBundle\Database\Facade\LabeledThing;
use AnnoStationBundle\Database\Facade\LabeledThingGroup;
use AnnoStationBundle\Service;
use AnnoStationBundle\Helper\ExportXml;

class RequirementsProjectToXml
{
    const XML_NAMESPACE = 'http://weblabel.hella-aglaia.com/schema/export';
    const REQUIREMENTS_XML_POSTFIX = 'labelconfiguration';

    /**
     * @var Facade\Exporter
     */
    private $exporterFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfiguration;

    /**
     * @var Service\GhostClassesPropagation
     */
    private $ghostClassesPropagation;

    /**
     * @var AppBundleFacade\User
     */
    private $userFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Service\LabeledFrameEndCalculationService
     */
    private $labeledFrameEndCalculationService;

    /**
     * @var Factory
     */
    private $labeledThingFacadeFactory;

    /**
     * @var Factory
     */
    private $labeledThingGroupFacadeFactory;

    /**
     * @var Factory
     */
    private $labelingTaskFacadeFactory;

    /**
     * @var Facade\AdditionalFrameNumberMapping
     */
    private $additionalFrameNumberMappingFacade;

    /**
     * @var Service\DepthBufferService
     */
    private $depthBufferService;
    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    /**
     * RequirementsProjectToXml constructor.
     *
     * @param Facade\Exporter                           $exporterFacade
     * @param Facade\Project                            $projectFacade
     * @param Facade\Video                              $videoFacade
     * @param LabelingTask                              $labelingTaskFacade
     * @param Facade\TaskConfiguration                  $taskConfiguration
     * @param Facade\AdditionalFrameNumberMapping       $additionalFrameNumberMappingFacade
     * @param Facade\CalibrationData                    $calibrationDataFacade
     * @param Service\GhostClassesPropagation           $ghostClassesPropagation
     * @param AppBundleFacade\User                      $userFacade
     * @param Facade\LabelingGroup                      $labelingGroupFacade
     * @param Service\LabeledFrameEndCalculationService $labeledFrameEndCalculationService
     * @param LabelingTask\FacadeInterface              $labelingTaskFacadeFactory
     * @param LabeledThing\FacadeInterface              $labeledThingFacadeFactory
     * @param LabeledThingGroup\FacadeInterface         $labeledThingGroupFacadeFactory
     * @param Service\DepthBuffer                       $depthBufferService
     */
    public function __construct(
        Facade\Exporter $exporterFacade,
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\TaskConfiguration $taskConfiguration,
        Facade\AdditionalFrameNumberMapping $additionalFrameNumberMappingFacade,
        Facade\CalibrationData $calibrationDataFacade,
        Service\GhostClassesPropagation $ghostClassesPropagation,
        AppBundleFacade\User $userFacade,
        Facade\LabelingGroup $labelingGroupFacade,
        Service\LabeledFrameEndCalculationService $labeledFrameEndCalculationService,
        LabelingTask\FacadeInterface $labelingTaskFacadeFactory,
        LabeledThing\FacadeInterface $labeledThingFacadeFactory,
        LabeledThingGroup\FacadeInterface $labeledThingGroupFacadeFactory,
        Service\DepthBuffer $depthBufferService
    ) {
        $this->exporterFacade                     = $exporterFacade;
        $this->projectFacade                      = $projectFacade;
        $this->videoFacade                        = $videoFacade;
        $this->labelingTaskFacade                 = $labelingTaskFacade;
        $this->taskConfiguration                  = $taskConfiguration;
        $this->ghostClassesPropagation            = $ghostClassesPropagation;
        $this->userFacade                         = $userFacade;
        $this->labelingGroupFacade                = $labelingGroupFacade;
        $this->labeledFrameEndCalculationService  = $labeledFrameEndCalculationService;
        $this->labelingTaskFacadeFactory          = $labelingTaskFacadeFactory;
        $this->labeledThingFacadeFactory          = $labeledThingFacadeFactory;
        $this->labeledThingGroupFacadeFactory     = $labeledThingGroupFacadeFactory;
        $this->additionalFrameNumberMappingFacade = $additionalFrameNumberMappingFacade;
        $this->depthBufferService                 = $depthBufferService;
        $this->calibrationDataFacade              = $calibrationDataFacade;
    }

    /**
     * @param Model\Export $export
     *
     * @throws \Exception
     */
    public function export(Model\Export $export)
    {
        $export = $this->exporterFacade->find($export->getId());
        $export->setStatus(Model\Export::EXPORT_STATUS_IN_PROGRESS);
        $this->exporterFacade->save($export);

        try {
            $zipData            = array();
            $project            = $this->projectFacade->find($export->getProjectId());
            $videoIterator      = new Iterator\Video($this->projectFacade, $this->videoFacade, $project);
            $taskConfigurations = [];
            foreach ($videoIterator as $video) {
                $labelingTaskIterator = new Iterator\LabelingTask($this->labelingTaskFacade, $video);
                /** @var Model\LabelingTask $task */
                foreach ($labelingTaskIterator as $task) {
                    $xmlConfiguration = $this->taskConfiguration->find($task->getTaskConfigurationId());

                    $taskConfigurations[$task->getTaskConfigurationId()] = $xmlConfiguration;
                }
                $additionalFrameNumberMapping = null;
                if ($project->getAdditionalFrameNumberMappingIdForVideo($video) !== null) {
                    $additionalFrameNumberMapping                          = $this->additionalFrameNumberMappingFacade->findById(
                        $project->getAdditionalFrameNumberMappingIdForVideo($video)
                    );
                    $zipData[$additionalFrameNumberMapping->getFileName(
                    )]                                                     = $additionalFrameNumberMapping->getAttachment(
                    );
                }

                $xml      = new ExportXml\Xml(self::XML_NAMESPACE);
                $metadata = new ExportXml\Element\Metadata(
                    $this->userFacade,
                    $project,
                    $export,
                    $this->labelingGroupFacade,
                    $taskConfigurations,
                    self::XML_NAMESPACE,
                    $additionalFrameNumberMapping
                );
                $xml->appendChild($metadata->getElement($xml->getDocument()));
                $xmlVideo = new ExportXml\Element\Video($video, self::XML_NAMESPACE);

                foreach ($labelingTaskIterator as $task) {
                    $labelingTaskFacade = $this->labelingTaskFacadeFactory->getFacadeByProjectIdAndTaskId(
                        $project->getId(),
                        $task->getId()
                    );
                    $labelingThingGroupFacade = $this->labeledThingGroupFacadeFactory->getFacadeByProjectIdAndTaskId(
                        $project->getId(),
                        $task->getId()
                    );
                    $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
                        $project->getId(),
                        $task->getId()
                    );

                    $frameMapping = $task->getFrameNumberMapping();

                    $labeledThingIterator = new Iterator\LabeledThing(
                        $task,
                        $labeledThingFacade
                    );

                    /** @var Model\LabeledThing $labeledThing */
                    foreach ($labeledThingIterator as $labeledThing) {
                        $references = new ExportXml\Element\Video\References(
                            new ExportXml\Element\Video\Task($task, self::XML_NAMESPACE),
                            self::XML_NAMESPACE
                        );
                        foreach ($labeledThing->getGroupIds() as $groupId) {
                            $group = $labelingThingGroupFacade->find($groupId);
                            if ($group !== null) {
                                $groupFrameRange = $labelingThingGroupFacade->getLabeledThingGroupFrameRange(
                                    $group
                                );
                                $xmlVideo->addGroup(
                                    new ExportXml\Element\Video\Group(
                                        $group,
                                        $frameMapping[$groupFrameRange['min']],
                                        $frameMapping[$groupFrameRange['max']],
                                        $labelingThingGroupFacade->isLabeledThingGroupIncomplete($group),
                                        self::XML_NAMESPACE
                                    )
                                );
                                $references->addGroup($groupId);
                            }
                        }

                        $thing = new ExportXml\Element\Video\Thing(
                            $frameMapping,
                            $labeledThing,
                            $references,
                            self::XML_NAMESPACE
                        );
                        $labeledThingInFrameForLabeledThing = new Iterator\LabeledThingInFrameForLabeledThing(
                            $labeledThingFacade,
                            $labeledThing,
                            $this->ghostClassesPropagation
                        );

                        $labeledThingInFramesInRanges = $this->getLabeledThingInFramesInRanges(
                            $labeledThingInFrameForLabeledThing
                        );
                        foreach ($labeledThingInFramesInRanges as $labeledThingInFramesInRange) {
                            /** @var Model\LabeledThingInFrame $labeledThingInFrame */
                            $labeledThingInFrame = $labeledThingInFramesInRange['labeledThingInFrame'];
                            $calibrationData = $video->getCalibrationId() === null ? null : $this->calibrationDataFacade->findById($video->getCalibrationId());
                            $shape               = new ExportXml\Element\Video\Shape(
                                $labeledThingInFrame->getShapesAsObjects()[0],
                                $frameMapping[$labeledThingInFramesInRange['start']],
                                $frameMapping[$labeledThingInFramesInRange['end']],
                                self::XML_NAMESPACE,
                                $calibrationData,
                                $this->depthBufferService
                            );
                            $thing->addShape($shape);
                            $thing->setType($labeledThingInFrame->getIdentifierName());
                        }

                        $valuesForRanges = $this->getValuesRanges($labeledThingInFrameForLabeledThing);
                        foreach ($valuesForRanges as $value) {
                            $thing->addValue(
                                $this->findClassIdForValue($value['value'], array_values($taskConfigurations)[0]),
                                $value['value'],
                                $frameMapping[$value['start']],
                                $frameMapping[$value['end']]
                            );
                        }
                        $xmlVideo->addThing($thing);
                    }

                    $labeledFrames    = new Iterator\LabeledFrame($task, $labelingTaskFacade);
                    if (count(iterator_to_array($labeledFrames, false)) > 0) {
                        $xmlVideo->setFrame(
                            $this->getLabeledFrameElement(
                                $task,
                                $labeledFrames,
                                $xml->getDocument(),
                                array_values($taskConfigurations)[0]
                            )
                        );
                    }
                }
                $xml->appendChild($xmlVideo->getElement($xml->getDocument()));
                $taskConfiguration = array_values($taskConfigurations)[0];
                $postfix = $this->getPostfixFromRequirementsXml($taskConfiguration);
                $zipData[$video->getName() . $postfix . '.xml'] = $xml->getDocument()->saveXML();
            }

            /** @var Model\TaskConfiguration $taskConfiguration */
            foreach ($taskConfigurations as $taskConfiguration) {
                $filename           = sprintf(
                    '%s.%s.%s',
                    basename($taskConfiguration->getFilename(), '.xml'),
                    self::REQUIREMENTS_XML_POSTFIX,
                    'xml'
                );
                $zipData[$filename] = $taskConfiguration->getRawData();
            }

            $zipContent = $this->compressData($zipData);

            $date     = new \DateTime('now', new \DateTimeZone('UTC'));
            $filename = sprintf(
                'export_%s.zip',
                $date->format('Y-m-d-H-i-s')
            );

            $export->addAttachment($filename, $zipContent, 'application/zip');
            $export->setStatus(Model\Export::EXPORT_STATUS_DONE);
            $this->exporterFacade->save($export);
        } catch (\Exception $exception) {
            $export->setStatus(Model\Export::EXPORT_STATUS_ERROR);
            $this->exporterFacade->save($export);

            throw $exception;
        }
    }

    /**
     * Search for the values parent class name
     * Note: This only works if all IDs are unique in the whole document
     *
     * @param                         $value
     * @param Model\TaskConfiguration $taskConfiguration
     *
     * @return string
     */
    private function findClassIdForValue($value, Model\TaskConfiguration $taskConfiguration)
    {
        $xmlImport = new \DOMDocument();
        $xmlImport->loadXML($taskConfiguration->getRawData());

        $xpath = new \DOMXPath($xmlImport);
        $xpath->registerNamespace('x', "http://weblabel.hella-aglaia.com/schema/requirements");

        $requirementsElement = $xpath->query(sprintf('//x:value[@id="%s"]', $value));

        if ($requirementsElement->length === 0) {
            throw new \RuntimeException(
                sprintf(
                    'Could not find any class for value "%s" in TaskConfiguration "%s"',
                    $value,
                    $taskConfiguration->getId()
                )
            );
        }

        return $requirementsElement->item(0)->parentNode->getAttribute('id');
    }

    /**
     * @param Model\LabelingTask      $task
     * @param Model\LabeledFrame[]    $labeledFrames
     * @param \DOMDocument            $xmlDocument
     * @param Model\TaskConfiguration $taskConfiguration
     *
     * @return ExportXml\Element\Video\FrameLabeling
     */
    private function getLabeledFrameElement(
        Model\LabelingTask $task,
        $labeledFrames,
        \DOMDocument $xmlDocument,
        Model\TaskConfiguration $taskConfiguration
    ) {
        $references = new ExportXml\Element\Video\References(
            new ExportXml\Element\Video\Task($task, self::XML_NAMESPACE),
            self::XML_NAMESPACE
        );

        $xmlLabeledFrame  = new ExportXml\Element\Video\FrameLabeling(self::XML_NAMESPACE, $references);
        $taskFrameMapping = $task->getFrameNumberMapping();

        $previousLabeledFrame = null;
        /** @var Model\LabeledFrame $labeledFrame */
        foreach ($labeledFrames as $labeledFrame) {
            foreach ($labeledFrame->getClasses() as $id) {
                if (!$this->isClassInLabeledFrame($previousLabeledFrame, $id)) {
                    $xmlLabeledFrame->addValue(
                        $xmlDocument,
                        $this->findClassIdForValue($id, $taskConfiguration),
                        $id,
                        $taskFrameMapping[$labeledFrame->getFrameIndex()],
                        $taskFrameMapping[$this->labeledFrameEndCalculationService->getEndOfForClassOfLabeledFrame(
                            $labeledFrame,
                            $id
                        )]
                    );
                }
            }
            $previousLabeledFrame = $labeledFrame;
            if ($labeledFrame->getIncomplete()) {
                $xmlLabeledFrame->setIncomplete(true);
            }
        }

        return $xmlLabeledFrame;
    }

    /**
     * @param $labeledFrame
     * @param $class
     *
     * @return bool
     */
    private function isClassInLabeledFrame($labeledFrame, $class)
    {
        if ($labeledFrame === null) {
            return false;
        }

        return $labeledFrame instanceof Model\LabeledFrame && in_array($class, $labeledFrame->getClasses());
    }

    /**
     * @param Model\TaskConfiguration\RequirementsXml $requirementsXml
     *
     * @return string
     */
    private function getPostfixFromRequirementsXml(Model\TaskConfiguration\RequirementsXml $requirementsXml)
    {
        $xmlImport = new \DOMDocument();
        $xmlImport->loadXML($requirementsXml->getRawData());

        $xpath = new \DOMXPath($xmlImport);
        $xpath->registerNamespace('x', "http://weblabel.hella-aglaia.com/schema/requirements");

        $requirementsElement = $xpath->query('/x:requirements/x:metadata/x:export-postfix');

        if ($requirementsElement->length === 0) {
            return '';
        }

        return sprintf(
            '_%s',
            $requirementsElement->item(0)->nodeValue
        );
    }

    /**
     * @param Iterator\LabeledThingInFrameForLabeledThing $labeledThingInFramesIterator
     *
     * @return array
     */
    private function getLabeledThingInFramesInRanges(
        Iterator\LabeledThingInFrameForLabeledThing $labeledThingInFramesIterator
    ) {
        $labeledThingInFrames = [];
        $lastIndex            = null;
        /** @var Model\LabeledThingInFrame $labeledThingInFrame */
        foreach ($labeledThingInFramesIterator as $labeledThingInFrame) {
            $currentFrameIndex = $labeledThingInFrame->getFrameIndex();
            if (!isset($labeledThingInFrames[$lastIndex])) {
                $labeledThingInFrames[$currentFrameIndex] = [
                    'labeledThingInFrame' => $labeledThingInFrame,
                    'start'               => $currentFrameIndex,
                    'end'                 => $currentFrameIndex,
                ];

                $lastIndex = $currentFrameIndex;
            } else {
                $lastLabeledThingInFrame = $labeledThingInFrames[$lastIndex];

                $lastShape = array_map(
                    function ($shape) {
                        unset($shape['id']);
                        unset($shape['labeledThingInFrameId']);

                        return $shape;
                    },
                    $lastLabeledThingInFrame['labeledThingInFrame']->getShapes()
                );

                $currentShape = array_map(
                    function ($shape) {
                        unset($shape['id']);
                        unset($shape['labeledThingInFrameId']);

                        return $shape;
                    },
                    $labeledThingInFrame->getShapes()
                );

                if ($lastShape === $currentShape) {
                    $labeledThingInFrames[$lastIndex]['end'] = $currentFrameIndex;
                } else {
                    $labeledThingInFrames[$currentFrameIndex] = [
                        'labeledThingInFrame' => $labeledThingInFrame,
                        'start'               => $currentFrameIndex,
                        'end'                 => $currentFrameIndex,
                    ];

                    $lastIndex = $currentFrameIndex;
                }
            }
        }

        return $labeledThingInFrames;
    }

    /**
     * @param Iterator\LabeledThingInFrameForLabeledThing $labeledThingInFramesIterator
     *
     * @return array
     */
    private function getValuesRanges(Iterator\LabeledThingInFrameForLabeledThing $labeledThingInFramesIterator)
    {
        $values                  = [];
        $lastFrameIndexForValues = [];
        /** @var Model\LabeledThingInFrame $labeledThingInFrame */
        foreach ($labeledThingInFramesIterator as $labeledThingInFrame) {
            foreach ($labeledThingInFrame->getClassesWithGhostClasses() as $class) {
                $key = sprintf('%s-%s', $class, $labeledThingInFrame->getFrameIndex());

                if ((isset($lastFrameIndexForValues[$class]) && isset($values[$lastFrameIndexForValues[$class]]['end']))
                    && $values[$lastFrameIndexForValues[$class]]['end'] === $labeledThingInFrame->getFrameIndex() - 1
                ) {
                    $values[$lastFrameIndexForValues[$class]]['end'] = $labeledThingInFrame->getFrameIndex();
                } else {
                    $values[$key]                    = [
                        'value' => $class,
                        'start' => $labeledThingInFrame->getFrameIndex(),
                        'end'   => $labeledThingInFrame->getFrameIndex(),
                    ];
                    $lastFrameIndexForValues[$class] = $key;
                }
            }
        }

        return $values;
    }

    /**
     * @param array $data
     *
     * @return string
     * @throws \Exception
     */
    private function compressData(array $data)
    {
        $zipFilename = tempnam(sys_get_temp_dir(), 'anno-export-xml-');

        $zip = new \ZipArchive();
        if ($zip->open($zipFilename, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new \Exception(sprintf('Unable to open zip archive at "%s"', $zipFilename));
        }

        if (empty($files)) {
            $zip->addEmptyDir('.');
        }
        foreach ($data as $filename => $value) {
            $zip->addFromString($filename, $value);
        }

        $zip->close();

        return file_get_contents($zipFilename);
    }
}
