<?php
namespace AppBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class LabelingTask implements \IteratorAggregate
{
    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var array
     */
    private $labelingTasks = [];

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * LabelingTask constructor.
     *
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Model\Video         $video
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade, Model\Video $video)
    {
        $this->video              = $video;
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    public function getIterator()
    {
        return $this->labelingTaskIteratorGenerator();
    }

    private function labelingTaskIteratorGenerator()
    {
        $this->labelingTasks = $this->labelingTaskFacade->findByVideoIds([$this->video->getId()]);

        foreach ($this->labelingTasks as $labelingTask) {
            yield $labelingTask;
        }
    }
}
