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

    /**
     * @var
     */
    private $namespace;

    public function __construct(Model\Export $export, Facade\User $userFacade, $namespace)
    {
        $this->export     = $export;
        $this->userFacade = $userFacade;
        $this->namespace  = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $export = $document->createElementNS($this->namespace, 'export');
        $export->setAttribute('id', $this->export->getId());

        $creationDate = $document->createElementNS(
            $this->namespace,
            'creation-date',
            $this->export->getDate()->format('c')
        );

        $user          = $this->userFacade->getUserById($this->export->getUserId());
        $createdByUser = $document->createElementNS($this->namespace, 'created-by-user');
        $createdByUser->setAttribute('username', $user->getUsername());
        $createdByUser->setAttribute('email', $user->getEmail());

        $export->appendChild($creationDate);
        $export->appendChild($createdByUser);

        return $export;
    }
}