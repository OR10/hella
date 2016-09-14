<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class VideoExport
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
     * @param string $id
     *
     * @return Model\VideoExport
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\VideoExport::class, $id);
    }

    /**
     * @param Model\VideoExport $videoExport
     *
     * @return Model\VideoExport
     */
    public function save(Model\VideoExport $videoExport)
    {
        $this->documentManager->persist($videoExport);
        $this->documentManager->flush();

        return $videoExport;
    }
}
