<?php
namespace AnnoStationBundle\Service\Exporter;

use AppBundle\Model;
use AnnoStationBundle\Helper\Iterator;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppBundleFacade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Helper\ExportXml;

class RequirementsProjectToXml
{
    const XML_NAMESPACE = 'http://weblabel.hella-aglaia.com/schema/export';

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
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacade;

    /**
     * @param Facade\Exporter                 $exporterFacade
     * @param Facade\Project                  $projectFacade
     * @param Facade\Video                    $videoFacade
     * @param Facade\LabelingTask             $labelingTaskFacade
     * @param Facade\TaskConfiguration        $taskConfiguration
     * @param Service\GhostClassesPropagation $ghostClassesPropagation
     * @param AppBundleFacade\User            $userFacade
     * @param Facade\LabelingGroup            $labelingGroupFacade
     * @param Facade\LabeledThing             $labeledThingFacade
     * @param Facade\LabeledThingGroup        $labeledThingGroupFacade
     */
    public function __construct(
        Facade\Exporter $exporterFacade,
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\TaskConfiguration $taskConfiguration,
        Service\GhostClassesPropagation $ghostClassesPropagation,
        AppBundleFacade\User $userFacade,
        Facade\LabelingGroup $labelingGroupFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingGroup $labeledThingGroupFacade
    ) {
        $this->exporterFacade          = $exporterFacade;
        $this->projectFacade           = $projectFacade;
        $this->videoFacade             = $videoFacade;
        $this->labelingTaskFacade      = $labelingTaskFacade;
        $this->taskConfiguration       = $taskConfiguration;
        $this->ghostClassesPropagation = $ghostClassesPropagation;
        $this->userFacade              = $userFacade;
        $this->labelingGroupFacade     = $labelingGroupFacade;
        $this->labeledThingFacade      = $labeledThingFacade;
        $this->labeledThingGroupFacade = $labeledThingGroupFacade;
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

                $xml      = new ExportXml\Xml(self::XML_NAMESPACE);
                $metadata = new ExportXml\Element\Metadata(
                    $this->userFacade,
                    $project,
                    $export,
                    $this->labelingGroupFacade,
                    $taskConfigurations,
                    self::XML_NAMESPACE
                );
                $xml->appendChild($metadata->getElement($xml->getDocument()));
                $xmlVideo = new ExportXml\Element\Video($video, self::XML_NAMESPACE);

                foreach ($labelingTaskIterator as $task) {
                    $frameMapping = $task->getFrameNumberMapping();

                    $labeledThingIterator = new Iterator\LabeledThing($task, $this->labelingTaskFacade);

                    /** @var Model\LabeledThing $labeledThing */
                    foreach ($labeledThingIterator as $labeledThing) {
                        $references = new ExportXml\Element\Video\References(
                            new ExportXml\Element\Video\Task($task, self::XML_NAMESPACE),
                            self::XML_NAMESPACE
                        );
                        foreach ($labeledThing->getGroupIds() as $groupId) {
                            $group = $this->labeledThingGroupFacade->find($groupId);
                            if ($group !== null) {
                                $groupFrameRange = $this->labeledThingGroupFacade->getLabeledThingGroupFrameRange(
                                    $group
                                );
                                $xmlVideo->addGroup(
                                    new ExportXml\Element\Video\Group(
                                        $group,
                                        $frameMapping[$groupFrameRange['min']],
                                        $frameMapping[$groupFrameRange['max']],
                                        $this->labeledThingGroupFacade->isLabeledThingGroupIncomplete($group),
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
                            $this->labeledThingFacade,
                            $labeledThing,
                            $this->ghostClassesPropagation
                        );

                        $labeledThingInFramesInRanges = $this->getLabeledThingInFramesInRanges(
                            $labeledThingInFrameForLabeledThing
                        );
                        foreach ($labeledThingInFramesInRanges as $labeledThingInFramesInRange) {
                            /** @var Model\LabeledThingInFrame $labeledThingInFrame */
                            $labeledThingInFrame = $labeledThingInFramesInRange['labeledThingInFrame'];
                            $shape               = new ExportXml\Element\Video\Shape(
                                $labeledThingInFrame->getShapesAsObjects()[0],
                                $frameMapping[$labeledThingInFramesInRange['start']],
                                $frameMapping[$labeledThingInFramesInRange['end']],
                                self::XML_NAMESPACE
                            );
                            $thing->addShape($shape);
                            $thing->setType($labeledThingInFrame->getIdentifierName());
                        }

                        $valuesForRanges = $this->getValuesRanges($labeledThingInFrameForLabeledThing);
                        foreach ($valuesForRanges as $value) {
                            $thing->addValue(
                                $value['value'],
                                $frameMapping[$value['start']],
                                $frameMapping[$value['end']]
                            );
                        }
                        $xmlVideo->addThing($thing);
                    }
                }
                $xml->appendChild($xmlVideo->getElement($xml->getDocument()));
                $zipData[$video->getName() . '.xml'] = $xml->getDocument()->saveXML();
            }

            /** @var Model\TaskConfiguration $taskConfiguration */
            foreach ($taskConfigurations as $taskConfiguration) {
                $zipData[$taskConfiguration->getFilename()] = $taskConfiguration->getRawData();
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
