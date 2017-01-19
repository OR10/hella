<?php
namespace AnnoStationBundle\Helper\ExportXml\Element;

use AnnoStationBundle\Helper\ExportXml;
use AnnoStationBundle\Helper\ExportXml\Element;
use AppBundle\Model;
use AppBundle\Database\Facade as AppBundleFacade;
use AnnoStationBundle\Database\Facade;

class Metadata extends ExportXml\Element
{
    /**
     * @var AppBundleFacade\User
     */
    private $userFacade;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\Export
     */
    private $export;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var
     */
    private $taskConfigurations;

    /**
     * @var
     */
    private $namespace;

    public function __construct(
        AppBundleFacade\User $userFacade,
        Model\Project $project,
        Model\Export $export,
        Facade\LabelingGroup $labelingGroupFacade,
        $taskConfigurations,
        $namespace
    ) {
        $this->userFacade          = $userFacade;
        $this->project             = $project;
        $this->export              = $export;
        $this->labelingGroupFacade = $labelingGroupFacade;
        $this->taskConfigurations  = $taskConfigurations;
        $this->namespace           = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $metadata = $document->createElementNS($this->namespace, 'metadata');

        $labelingGroup = $this->labelingGroupFacade->find($this->project->getLabelingGroupId());

        $annostation = new Element\Metadata\AnnoStation(gethostname(), '0', $this->namespace);
        $metadata->appendChild($annostation->getElement($document));

        $project = new Element\Metadata\Project($this->project, $this->userFacade, $this->namespace);
        $metadata->appendChild($project->getElement($document));

        $export = new Element\Metadata\Export($this->export, $this->userFacade, $this->namespace);
        $metadata->appendChild($export->getElement($document));

        $labelingGroup = new Element\Metadata\LabelingGroup($labelingGroup, $this->userFacade, $this->namespace);
        $metadata->appendChild($labelingGroup->getElement($document));

        foreach ($this->taskConfigurations as $taskConfiguration) {
            $requirements = new Element\Metadata\Requirements($taskConfiguration, $this->namespace);
            $metadata->appendChild($requirements->getElement($document));
        }

        /*
        $workflow = new Element\Metadata\Workflow();
        $metadata->appendChild($workflow->getElement($document));

        $tags = new Element\Metadata\Tags();
        $metadata->appendChild($tags->getElement($document));
        */

        return $metadata;
    }
}