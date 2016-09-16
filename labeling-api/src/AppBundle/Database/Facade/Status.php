<?php

namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;
use League\Flysystem;

class Status
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
     * @param string $type
     * @param string $id
     *
     * @return Model\Status
     */
    public function find($type, $id)
    {
        $class = str_replace('.', '\\', $type);

        if (!is_subclass_of($class, Model\Status::class)) {
            throw new \RuntimeException("Invalid status type '{$type}'");
        }

        return $this->documentManager->find($class, $id);
    }

    /**
     * @param Model\Status $status
     */
    public function save(Model\Status $status)
    {
        $this->documentManager->persist($status);
        $this->documentManager->flush();
    }
}
