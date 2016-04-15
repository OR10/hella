<?php

namespace AppBundle\Tests\Database\Facade;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class LabelingTaskTest extends Tests\WebTestCase
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    public function dateProvider()
    {
        return array(
            array(
                array(
                    new \DateTime('2014-12-11 15:41:46'),
                    new \DateTime('2016-04-11 18:41:46'),
                    new \DateTime('2016-03-11 12:41:46'),
                    new \DateTime('2016-04-11 13:41:46'),
                    new \DateTime('2016-04-11 08:41:46'),
                    new \DateTime('2016-01-11 13:41:46'),
                    new \DateTime('2014-04-11 13:41:46'),
                    new \DateTime('2016-02-11 09:41:46'),
                ),
                array(
                    new \DateTime('2014-04-11 13:41:46'),
                    new \DateTime('2014-12-11 15:41:46'),
                    new \DateTime('2016-01-11 13:41:46'),
                    new \DateTime('2016-02-11 09:41:46'),
                    new \DateTime('2016-03-11 12:41:46'),
                    new \DateTime('2016-04-11 08:41:46'),
                    new \DateTime('2016-04-11 13:41:46'),
                    new \DateTime('2016-04-11 18:41:46'),
                )
            ),
        );
    }

    /**
     * @dataProvider dateProvider
     *
     * @param $dateTimes
     * @param $expectedDateTimes
     */
    public function testGetTaskList($dateTimes, $expectedDateTimes)
    {
        $video = Model\Video::create('foobar');
        $project = Model\Project::create('test project');
        foreach ($dateTimes as $dateTime) {
            $this->labelingTaskFacade->save(Model\LabelingTask::create(
                $video,
                $project,
                range(10, 20),
                Model\LabelingTask::TYPE_OBJECT_LABELING,
                null,
                array(),
                array(),
                $dateTime
            ));
        }

        $tasks = $this->labelingTaskFacade->findAllByStatus($video, Model\LabelingTask::STATUS_PREPROCESSING);

        $tasksDates = array_map(function (Model\LabelingTask $task) {
            return $task->getCreatedAt();
        }, $tasks);

        $this->assertEquals($expectedDateTimes, $tasksDates);
    }

    protected function setUpImplementation()
    {
        $this->videoFacade = $this->getAnnostationService('database.facade.video');
        $this->projectFacade = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');
    }
}