<?php

namespace AnnoStationBundle\Database\Facade;

use AnnoStationBundle\Model;
use Doctrine\ODM\CouchDB;

class AdditionalFrameNumberMapping
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
     * @return Model\AdditionalFrameNumberMapping
     */
    public function findById($id)
    {
        return $this->documentManager->find(Model\AdditionalFrameNumberMapping::class, $id);
    }

    /**
     * @param Model\AdditionalFrameNumberMapping $additionalFrameNumberMapping
     *
     * @return Model\AdditionalFrameNumberMapping
     */
    public function save(Model\AdditionalFrameNumberMapping $additionalFrameNumberMapping)
    {
        $this->documentManager->persist($additionalFrameNumberMapping);
        $this->documentManager->flush();

        return $additionalFrameNumberMapping;
    }

    /**
     * @param Model\AdditionalFrameNumberMapping $additionalFrameNumberMapping
     */
    public function delete(Model\AdditionalFrameNumberMapping $additionalFrameNumberMapping)
    {
        $this->documentManager->remove($additionalFrameNumberMapping);
        $this->documentManager->flush();
    }
}
