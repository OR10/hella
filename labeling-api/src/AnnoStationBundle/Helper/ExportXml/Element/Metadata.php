<?php
namespace AnnoStationBundle\Helper\ExportXml\Element;

use AnnoStationBundle\Helper\ExportXml;
use AnnoStationBundle\Helper\ExportXml\Element;
use AnnoStationBundle\Model as AnnoStationBundleModel;
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
     * @var Facade\Campaign
     */
    private $campaignFacade;

    /**
     * @var array
     */
    private $taskConfigurations;

    /**
     * @var string
     */
    private $namespace;

    /**
     * @var AnnoStationBundleModel\AdditionalFrameNumberMapping
     */
    private $additionalFrameNumberMapping;

    public function __construct(
        AppBundleFacade\User $userFacade,
        Model\Project $project,
        Model\Export $export,
        Facade\LabelingGroup $labelingGroupFacade,
        Facade\Campaign $campaignFacade,
        $taskConfigurations,
        $namespace,
        AnnoStationBundleModel\AdditionalFrameNumberMapping $additionalFrameNumberMapping = null
    ) {
        $this->userFacade                   = $userFacade;
        $this->project                      = $project;
        $this->export                       = $export;
        $this->labelingGroupFacade          = $labelingGroupFacade;
        $this->campaignFacade               = $campaignFacade;
        $this->taskConfigurations           = $taskConfigurations;
        $this->namespace                    = $namespace;
        $this->additionalFrameNumberMapping = $additionalFrameNumberMapping;
    }

    public function getElement(\DOMDocument $document)
    {
        $metadata = $document->createElementNS($this->namespace, 'metadata');


        $annostation = new Element\Metadata\AnnoStation($this->namespace, gethostname(), '0');
        $metadata->appendChild($annostation->getElement($document));

        $project = new Element\Metadata\Project($this->project, $this->userFacade, $this->namespace);
        $metadata->appendChild($project->getElement($document));

        $export = new Element\Metadata\Export($this->export, $this->userFacade, $this->namespace);
        $metadata->appendChild($export->getElement($document));

        if ($this->project->getLabelingGroupId() !== null) {
            $labelingGroup = $this->labelingGroupFacade->find($this->project->getLabelingGroupId());
            if ($labelingGroup !== null) {
                $labelingGroup = new Element\Metadata\LabelingGroup(
                    $labelingGroup,
                    $this->userFacade,
                    $this->namespace
                );
                $metadata->appendChild($labelingGroup->getElement($document));
            }
        }

        foreach ($this->taskConfigurations as $taskConfiguration) {
            $requirements = new Element\Metadata\Requirements($taskConfiguration, $this->namespace);
            $metadata->appendChild($requirements->getElement($document));
        }

        if ($this->additionalFrameNumberMapping !== null) {
            $additionalFrameNumberMapping = new Element\Metadata\AdditionalFrameNumberMapping(
                $this->additionalFrameNumberMapping, $this->namespace
            );
            $metadata->appendChild($additionalFrameNumberMapping->getElement($document));
        }

        /*
        $workflow = new Element\Metadata\Workflow();
        $metadata->appendChild($workflow->getElement($document));
        */

        $tags        = new Element\Metadata\Tags($this->namespace, $this->project, $this->campaignFacade);
        $tagsElement = $tags->getElement($document);
        if ($tagsElement->hasChildNodes()) {
            $metadata->appendChild($tags->getElement($document));
        }

        return $metadata;
    }
}
