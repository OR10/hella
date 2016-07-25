<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabelingGroup
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param $id
     * @return Model\LabelingGroup
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\LabelingGroup::class, $id);
    }

    /**
     * @param Model\LabelingGroup $labelingGroup
     * @return Model\LabelingGroup
     */
    public function save(Model\LabelingGroup $labelingGroup)
    {
        $this->documentManager->persist($labelingGroup);
        $this->documentManager->flush();

        return $labelingGroup;
    }

    /**
     * @param Model\LabelingGroup $labelingGroup
     * @return Model\LabelingGroup
     */
    public function delete(Model\LabelingGroup $labelingGroup)
    {
        $this->documentManager->remove($labelingGroup);
        $this->documentManager->flush();

        return $labelingGroup;
    }

    /**
     * @return \Doctrine\CouchDB\View\Result
     */
    public function findAll()
    {
        return $this->documentManager
            ->createQuery('annostation_labeling_group', 'by_id')
            ->onlyDocs(true)
            ->execute();
    }
}