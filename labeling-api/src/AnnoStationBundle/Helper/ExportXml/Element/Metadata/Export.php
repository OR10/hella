<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model;
use AppBundle\Database\Facade;

class Export extends ExportXml\Element
{
    /**
     * @var Model\Export
     */
    private $export;

    /**
     * @var Facade\User
     */
    private $userFacade;

    public function __construct(Model\Export $export, Facade\User $userFacade)
    {
        $this->export     = $export;
        $this->userFacade = $userFacade;
    }

    public function getElement(\DOMDocument $document)
    {
        $export = $document->createElement('export');
        $export->setAttribute('id', $this->export->getId());

        $creationDate = $document->createElement('creation-date', $this->export->getDate()->format('c'));

        $user          = $this->userFacade->getUserById($this->export->getUserId());
        $createdByUser = $document->createElement('created-by-user');
        $createdByUser->setAttribute('username', $user->getUsername());
        $createdByUser->setAttribute('email', $user->getEmail());

        $export->appendChild($creationDate);
        $export->appendChild($createdByUser);

        return $export;
    }
}