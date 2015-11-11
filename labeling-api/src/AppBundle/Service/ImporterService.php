<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use AppBundle\Database\Facade;
use AppBundle\Service;
use crosscan\WorkerPool\AMQP;
use AppBundle\Worker\Jobs;

class ImporterService
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Service\Video\MetaDataReader
     */
    private $metaDataReader;

    /**
     * @var Service\Video\VideoFrameSplitter
     */
    private $frameCdnSplitter;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $facadeAMQP;

    /**
     * ImportVideoCommand constructor.
     *
     * @param Facade\Video                 $videoFacade
     * @param Facade\LabelingTask          $labelingTaskFacade
     * @param Service\Video\MetaDataReader $metaDataReader
     * @param Video\VideoFrameSplitter     $frameCdnSplitter
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\Video\MetaDataReader $metaDataReader,
        Service\Video\VideoFrameSplitter $frameCdnSplitter,
        AMQP\FacadeAMQP $facadeAMQP
    )
    {
        $this->videoFacade        = $videoFacade;
        $this->metaDataReader     = $metaDataReader;
        $this->frameCdnSplitter   = $frameCdnSplitter;
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->facadeAMQP         = $facadeAMQP;
    }

    /**
     * @param string $filename
     * @param        $stream
     *
     * @return Model\LabelingTask
     *
     * @throws Video\Exception\MetaDataReader
     * @throws \Exception
     */
    public function import($filename, $stream)
    {
        $video = new Model\Video(basename($filename));
        $video->setMetaData($this->metaDataReader->readMetaData($filename));
        $this->videoFacade->save($video, $stream);

        $imageTypeNames = array_keys(ImageType\Base::$imageTypes);

        $task = $this->addTask($video, $imageTypeNames);

        // @todo This list currently contains all image types since the
        //       labeling task is currently created by this service for the
        //       whole video. This may change in future versions where some or
        //       all image types are defined by the labeling task. However,
        //       when this happens, this service has to be refactored anyway.
        foreach ($imageTypeNames as $imageTypeName) {
            $video->setImageTypeConvertedStatus($imageTypeName);
            $this->videoFacade->update();
            $job = new Jobs\VideoFrameSplitter(
                $video->getId(),
                $video->getSourceVideoPath(),
                ImageType\Base::create($imageTypeName)
            );

            $this->facadeAMQP->addJob($job);
        }


        return $task;
    }

    /**
     * Add a LabelingTask
     *
     * @param Model\Video $video
     *
     * @param             $imageTypes
     * @return Model\LabelingTask
     */
    private function addTask(Model\Video $video, $imageTypes)
    {
        $metadata     = $video->getMetaData();
        $frameRange   = new Model\FrameRange(1, $metadata->numberOfFrames);
        $labelingTask = new Model\LabelingTask($video, $frameRange, $imageTypes);
        $this->labelingTaskFacade->save($labelingTask);

        return $labelingTask;
    }
}
