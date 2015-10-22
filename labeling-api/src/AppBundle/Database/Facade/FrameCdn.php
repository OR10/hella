<?php

namespace AppBundle\Database\Facade;

use AppBundle\Model;
use AppBundle\Type\Video;
use Doctrine\ODM\CouchDB;

class FrameCdn
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * FrameCdn constructor.
     *
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param Model\LabelingTask $labeledFrame
     * @param Video\Base         $type
     *
     * @return array
     */
    public function getFrameLocations(Model\LabelingTask $labeledFrame, Video\Base $type, $limit, $offset = 0)
    {
        //TODO: return frame locations
        return array_fill(0, $limit, 'https://placehold.it/1280x720');
    }
}