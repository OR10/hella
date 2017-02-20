<?php
namespace AnnoStationBundle\Database\Facade;

use AnnoStationBundle\Model;
use Doctrine\ODM\CouchDB;

class Organisation
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * Organisation constructor.
     *
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param string $id
     *
     * @return Model\Organisation
     */
    public function find(string $id)
    {
        return $this->documentManager->find(Model\Organisation::class, $id);
    }

    /**
     * @param null $skip
     * @param null $limit
     *
     * @return Model\Organisation[]
     */
    public function findAll($skip = null, $limit = null)
    {
        $query = $this->documentManager
            ->createQuery('annostation_organisation_by_id', 'view')
            ->onlyDocs(true);

        if ($skip !== null) {
            $query->setSkip($skip);
        }

        if ($limit !== null) {
            $query->setLimit($limit);
        }

        return $query->execute()->toArray();
    }

    /**
     * @param Model\Organisation $organisation
     *
     * @return Model\Organisation
     */
    public function save(Model\Organisation $organisation)
    {
        $this->documentManager->persist($organisation);
        $this->documentManager->flush();

        return $organisation;
    }

    /**
     * @param Model\Organisation $organisation
     */
    public function delete(Model\Organisation $organisation)
    {
        $this->documentManager->remove($organisation);
        $this->documentManager->flush();
    }
}