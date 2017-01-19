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

    public function __construct(
        AppBundleFacade\User $userFacade,
        Model\Project $project,
        Model\Export $export,
        Facade\LabelingGroup $labelingGroupFacade,
        $taskConfigurations
    ) {
        $this->userFacade          = $userFacade;
        $this->project             = $project;
        $this->export              = $export;
        $this->labelingGroupFacade = $labelingGroupFacade;
        $this->taskConfigurations  = $taskConfigurations;
    }

    public function getElement(\DOMDocument $document)
    {
        $metadata = $document->createElement('metadata');

        $labelingGroup = $this->labelingGroupFacade->find($this->project->getLabelingGroupId());

        $annostation   = new Element\Metadata\AnnoStation();
        $metadata->appendChild($annostation->getElement($document));

        $project       = new Element\Metadata\Project($this->project, $this->userFacade);
        $metadata->appendChild($project->getElement($document));

        $export        = new Element\Metadata\Export($this->export, $this->userFacade);
        $metadata->appendChild($export->getElement($document));

        $labelingGroup = new Element\Metadata\LabelingGroup($labelingGroup, $this->userFacade);
        $metadata->appendChild($labelingGroup->getElement($document));

        foreach($this->taskConfigurations as $taskConfiguration) {
            $requirements = new Element\Metadata\Requirements($taskConfiguration);
            $metadata->appendChild($requirements->getElement($document));
        }

        $workflow = new Element\Metadata\Workflow();
        $metadata->appendChild($workflow->getElement($document));

        $tags = new Element\Metadata\Tags();
        $metadata->appendChild($tags->getElement($document));


        return $metadata;
    }
}