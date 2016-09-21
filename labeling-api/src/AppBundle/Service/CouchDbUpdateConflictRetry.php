<?php
namespace AppBundle\Service;

use Doctrine\ODM\CouchDB;

class CouchDbUpdateConflictRetry
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
     * @param     $doc
     * @param     $callable
     * @param int $retries
     * @return mixed
     * @throws CouchDB\UpdateConflictException
     */
    public function save($doc, $callable, $retries = 5)
    {
        $conflictException = null;

        while ($retries > 0) {
            $conflictException = null;
            try {
                call_user_func($callable, $doc);
                $this->documentManager->persist($doc);
                $this->documentManager->flush();

                return $doc;
            } catch (CouchDB\UpdateConflictException $exception) {
                $conflictException = $exception;
                $this->documentManager->refresh($doc);
            }

            --$retries;
        }

        throw $conflictException;
    }
}
