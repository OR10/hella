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

    public function __construct(Model\LabelingGroup $labelingGroup, Facade\User $userFacade)
    {
        $this->labelingGroup = $labelingGroup;
        $this->userFacade    = $userFacade;
    }

    public function getElement(\DOMDocument $document)
    {
        $labelingGroup = $document->createElement('labeling-group');

        $labelingGroup->setAttribute('id', $this->labelingGroup->getId());
        $labelingGroup->setAttribute('name', $this->labelingGroup->getName());

        foreach ($this->labelingGroup->getCoordinators() as $coordinatorId) {
            $user        = $this->userFacade->getUserById($coordinatorId);
            $coordinator = $document->createElement('coordinator');
            $coordinator->setAttribute('username', $user->getUsername());
            $coordinator->setAttribute('email', $user->getEmail());

            $labelingGroup->appendChild($coordinator);
        }

        foreach ($this->labelingGroup->getLabeler() as $labelerId) {
            $user    = $this->userFacade->getUserById($labelerId);
            $labeler = $document->createElement('labeler');
            $labeler->setAttribute('username', $user->getUsername());
            $labeler->setAttribute('email', $user->getEmail());

            $labelingGroup->appendChild($labeler);
        }

        return $labelingGroup;
    }
}