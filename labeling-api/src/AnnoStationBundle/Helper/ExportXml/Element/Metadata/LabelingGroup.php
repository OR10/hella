<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Database\Facade;
use AppBundle\Model;

class LabelingGroup extends ExportXml\Element
{
    /**
     * @var Model\LabelingGroup
     */
    private $labelingGroup;

    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * @var string
     */
    private $namespace;

    public function __construct(Model\LabelingGroup $labelingGroup, Facade\User $userFacade, $namespace)
    {
        $this->labelingGroup = $labelingGroup;
        $this->userFacade    = $userFacade;
        $this->namespace     = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $labelingGroup = $document->createElementNS($this->namespace, 'labeling-group');

        $labelingGroup->setAttribute('id', $this->labelingGroup->getId());
        $labelingGroup->setAttribute('name', $this->labelingGroup->getName());

        foreach ($this->labelingGroup->getCoordinators() as $coordinatorId) {
            $user        = $this->userFacade->getUserById($coordinatorId);
            $coordinator = $document->createElementNS($this->namespace, 'coordinator');
            $coordinator->setAttribute('username', $user->getUsername());
            $coordinator->setAttribute('email', $user->getEmail());

            $labelingGroup->appendChild($coordinator);
        }

        foreach ($this->labelingGroup->getLabeler() as $labelerId) {
            $user    = $this->userFacade->getUserById($labelerId);
            $labeler = $document->createElementNS($this->namespace, 'labeler');
            $labeler->setAttribute('username', $user->getUsername());
            $labeler->setAttribute('email', $user->getEmail());

            $labelingGroup->appendChild($labeler);
        }

        return $labelingGroup;
    }
}
