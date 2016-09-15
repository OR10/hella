<?php

namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class CalibrationData
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param $id
     *
     * @return Model\CalibrationData
     */
    public function findById($id)
    {
        return $this->documentManager->find(Model\CalibrationData::class, $id);
    }

    /**
     * @param Model\CalibrationData $calibrationData
     *
     * @return Model\CalibrationData
     */
    public function save(Model\CalibrationData $calibrationData)
    {
        $this->documentManager->persist($calibrationData);
        $this->documentManager->flush();

        return $calibrationData;
    }
}
