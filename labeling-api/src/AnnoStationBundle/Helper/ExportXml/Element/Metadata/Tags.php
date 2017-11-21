<?php

namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class Tags extends ExportXml\Element
{
    /**
     * @var string
     */
    private $namespace;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Facade\Campaign
     */
    private $campaignFacade;

    public function __construct($namespace, Model\Project $project, Facade\Campaign $campaignFacade)
    {
        $this->namespace      = $namespace;
        $this->project        = $project;
        $this->campaignFacade = $campaignFacade;
    }

    public function getElement(\DOMDocument $document)
    {
        $tags = $document->createElementNS($this->namespace, 'tags');

        foreach ($this->project->getCampaigns() as $campaignId) {
            $campaign = $this->campaignFacade->find($campaignId);
            $tag      = $document->createElementNS($this->namespace, 'tag', $campaign->getName());
            $tags->appendChild($tag);
        }

        return $tags;
    }
}
