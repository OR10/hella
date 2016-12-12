<?php
namespace AnnoStationBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class Video implements \IteratorAggregate
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
     * @var array
     */
    private $videos = [];

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $videoFacade;

    /**
     * LabelingTask constructor.
     *
     * @param Facade\Project $projectFacade
     * @param Facade\Video   $videoFacade
     * @param Model\Project  $project
     */
    public function __construct(Facade\Project $projectFacade, Facade\Video $videoFacade, Model\Project $project)
    {
        $this->projectFacade = $projectFacade;
        $this->videoFacade   = $videoFacade;
        $this->project       = $project;
    }

    public function getIterator()
    {
        return $this->labelingTaskIteratorGenerator();
    }

    private function labelingTaskIteratorGenerator()
    {
        if (empty($this->labelingTasks)) {
            $this->labelingTasks = $this->projectFacade->getTasksByProject($this->project);
        }

        $videoIds = array_map(
            function (Model\LabelingTask $task) {
                return $task->getVideoId();
            },
            $this->labelingTasks
        );

        $this->videos = $this->videoFacade->findById($videoIds);

        foreach ($this->videos as $video) {
            yield $video;
        }
    }
}
