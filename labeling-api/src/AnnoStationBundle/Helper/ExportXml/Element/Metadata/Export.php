<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model;
use AppBundle\Database\Facade as AppBundleFacade;

class Export extends ExportXml\Element
{
    /**
     * @var Model\Export
     */
    private $export;

    /**
     * @var AppBundleFacade\User
     */
    private $userFacade;

    public function __construct(Model\Export $export, AppBundleFacade\User $userFacade)
    {
        $this->export     = $export;
        $this->userFacade = $userFacade;
    }

    public function getElement(\DOMDocument $document)
    {
        $export = $document->createElement('export');

        $export->setAttribute('id', $this->export->getId());

        $creationDate            = $document->createElement('creation-date', $this->export->getDate()->format('c'));
        $createdByUser           = $document->createElement('created-by-user');
        $createdByUser->setAttribute('username', 'Not implemented yet!');
        $createdByUser->setAttribute('email', 'Not implemented yet!');

        $export->appendChild($creationDate);
        $export->appendChild($createdByUser);

        return $export;
    }
}