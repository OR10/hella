<?php

namespace AnnoStationBundle\Tests\Database\Facade;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Tests\Helper;
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

    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    public function taskProvider()
    {
        return array(
            array(
                array(
                    array(
                        'videoName' => 'foobar1.mp4',
                        'date'      => new \DateTime('2016-04-11 18:41:46'),
                        'status'    => array(
                            Model\LabelingTask::PHASE_PREPROCESSING => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_LABELING      => Model\LabelingTask::STATUS_TODO,
                        ),
                    ),
                    array(
                        'videoName' => 'foobar2.mp4',
                        'date'      => new \DateTime('2016-05-11 18:41:46'),
                        'status'    => array(
                            Model\LabelingTask::PHASE_PREPROCESSING => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_LABELING      => Model\LabelingTask::STATUS_TODO,
                        ),
                    ),
                    array(
                        'videoName' => 'foobar3.mp4',
                        'date'      => new \DateTime('2016-05-12 18:41:46'),
                        'status'    => array(
                            Model\LabelingTask::PHASE_PREPROCESSING => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_LABELING      => Model\LabelingTask::STATUS_IN_PROGRESS,
                        ),
                    ),
                    array(
                        'videoName' => 'foobar4.mp4',
                        'date'      => new \DateTime('2016-05-12 18:41:46'),
                        'status'    => array(
                            Model\LabelingTask::PHASE_PREPROCESSING => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_LABELING      => Model\LabelingTask::STATUS_DONE,
                        ),
                    ),
                    array(
                        'videoName' => 'foobar5.mp4',
                        'date'      => new \DateTime('2016-05-13 18:41:46'),
                        'status'    => array(
                            Model\LabelingTask::PHASE_PREPROCESSING => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_LABELING      => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_REVIEW        => Model\LabelingTask::STATUS_TODO,
                        ),
                    ),
                    array(
                        'videoName' => 'foobar6.mp4',
                        'date'      => new \DateTime('2016-05-14 18:41:46'),
                        'status'    => array(
                            Model\LabelingTask::PHASE_PREPROCESSING => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_LABELING      => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_REVIEW        => Model\LabelingTask::STATUS_IN_PROGRESS,
                        ),
                    ),
                    array(
                        'videoName' => 'foobar7.mp4',
                        'date'      => new \DateTime('2016-05-15 18:41:46'),
                        'status'    => array(
                            Model\LabelingTask::PHASE_PREPROCESSING => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_LABELING      => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_REVIEW        => Model\LabelingTask::STATUS_DONE,
                        ),
                    ),
                    array(
                        'videoName' => 'foobar8.mp4',
                        'date'      => new \DateTime('2016-05-16 18:41:46'),
                        'status'    => array(
                            Model\LabelingTask::PHASE_PREPROCESSING => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_LABELING      => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_REVIEW        => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_REVISION      => Model\LabelingTask::STATUS_TODO,
                        ),
                    ),
                    array(
                        'videoName' => 'foobar9.mp4',
                        'date'      => new \DateTime('2016-05-17 18:41:46'),
                        'status'    => array(
                            Model\LabelingTask::PHASE_PREPROCESSING => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_LABELING      => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_REVIEW        => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_REVISION      => Model\LabelingTask::STATUS_IN_PROGRESS,
                        ),
                    ),
                    array(
                        'videoName' => 'foobar10.mp4',
                        'date'      => new \DateTime('2016-05-18 18:41:46'),
                        'status'    => array(
                            Model\LabelingTask::PHASE_PREPROCESSING => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_LABELING      => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_REVIEW        => Model\LabelingTask::STATUS_DONE,
                            Model\LabelingTask::PHASE_REVISION      => Model\LabelingTask::STATUS_DONE,
                        ),
                    ),
                ),
                array(
                    Model\LabelingTask::PHASE_LABELING         => array(
                        Model\LabelingTask::STATUS_TODO        => array(
                            array(
                                'videoName' => 'foobar2.mp4',
                                'date'      => new \DateTime('2016-05-11 18:41:46'),
                            ),
                            array(
                                'videoName' => 'foobar1.mp4',
                                'date'      => new \DateTime('2016-04-11 18:41:46'),
                            ),
                        ),
                        Model\LabelingTask::STATUS_IN_PROGRESS => array(
                            array(
                                'videoName' => 'foobar3.mp4',
                                'date'      => new \DateTime('2016-05-12 18:41:46'),
                            ),
                        ),
                        Model\LabelingTask::STATUS_DONE        => array(
                            array(
                                'videoName' => 'foobar9.mp4',
                                'date'      => new \DateTime('2016-05-17 18:41:46'),
                            ),
                            array(
                                'videoName' => 'foobar8.mp4',
                                'date'      => new \DateTime('2016-05-16 18:41:46'),
                            ),
                            array(
                                'videoName' => 'foobar7.mp4',
                                'date'      => new \DateTime('2016-05-15 18:41:46'),
                            ),
                            array(
                                'videoName' => 'foobar6.mp4',
                                'date'      => new \DateTime('2016-05-14 18:41:46'),
                            ),
                            array(
                                'videoName' => 'foobar5.mp4',
                                'date'      => new \DateTime('2016-05-13 18:41:46'),
                            ),
                            array(
                                'videoName' => 'foobar4.mp4',
                                'date'      => new \DateTime('2016-05-12 18:41:46'),
                            ),
                            array(
                                'videoName' => 'foobar10.mp4',
                                'date'      => new \DateTime('2016-05-18 18:41:46'),
                            ),
                        ),
                    ),
                    Model\LabelingTask::PHASE_REVIEW           => array(
                        Model\LabelingTask::STATUS_TODO        => array(
                            array(
                                'videoName' => 'foobar5.mp4',
                                'date'      => new \DateTime('2016-05-13 18:41:46'),
                            ),
                        ),
                        Model\LabelingTask::STATUS_IN_PROGRESS => array(
                            array(
                                'videoName' => 'foobar6.mp4',
                                'date'      => new \DateTime('2016-05-14 18:41:46'),
                            ),
                        ),
                        Model\LabelingTask::STATUS_DONE        => array(
                            array(
                                'videoName' => 'foobar9.mp4',
                                'date'      => new \DateTime('2016-05-17 18:41:46'),
                            ),
                            array(
                                'videoName' => 'foobar8.mp4',
                                'date'      => new \DateTime('2016-05-16 18:41:46'),
                            ),
                            array(
                                'videoName' => 'foobar7.mp4',
                                'date'      => new \DateTime('2016-05-15 18:41:46'),
                            ),
                            array(
                                'videoName' => 'foobar10.mp4',
                                'date'      => new \DateTime('2016-05-18 18:41:46'),
                            ),
                        ),
                    ),
                    Model\LabelingTask::PHASE_REVISION         => array(
                        Model\LabelingTask::STATUS_TODO        => array(
                            array(
                                'videoName' => 'foobar8.mp4',
                                'date'      => new \DateTime('2016-05-16 18:41:46'),
                            ),
                        ),
                        Model\LabelingTask::STATUS_IN_PROGRESS => array(
                            array(
                                'videoName' => 'foobar9.mp4',
                                'date'      => new \DateTime('2016-05-17 18:41:46'),
                            ),
                        ),
                        Model\LabelingTask::STATUS_DONE        => array(
                            array(
                                'videoName' => 'foobar10.mp4',
                                'date'      => new \DateTime('2016-05-18 18:41:46'),
                            ),
                        ),
                    ),
                    Model\LabelingTask::STATUS_ALL_PHASES_DONE => array(
                        array(
                            'videoName' => 'foobar7.mp4',
                            'date'      => new \DateTime('2016-05-15 18:41:46'),
                        ),
                        array(
                            'videoName' => 'foobar4.mp4',
                            'date'      => new \DateTime('2016-05-12 18:41:46'),
                        ),
                        array(
                            'videoName' => 'foobar10.mp4',
                            'date'      => new \DateTime('2016-05-18 18:41:46'),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * @dataProvider taskProvider
     *
     * @param $sampleTaskData
     * @param $expectedTasksByPhase
     */
    public function testGetTasks($sampleTaskData, $expectedTasksByPhase)
    {
        $project = Helper\ProjectBuilder::create()->build();
        $this->projectFacade->save($project);

        foreach ($sampleTaskData as $sampleTask) {
            $video = Helper\VideoBuilder::create()->withName($sampleTask['videoName'])->build();
            $this->videoFacade->save($video);
            $task = Helper\LabelingTaskBuilder::create($project, $video);
            foreach ($sampleTask['status'] as $phase => $status) {
                $task->withStatus($phase, $status);
            }
            $task->withCreationDate($sampleTask['date']);
            $this->labelingTaskFacade->save($task->build());
        }

        foreach ($expectedTasksByPhase as $expectedPhase => $tasksByState) {
            if ($expectedPhase === Model\LabelingTask::STATUS_ALL_PHASES_DONE) {
                $tasks = $this->labelingTaskFacade->getAllDoneLabelingTasksForProject($project)->toArray();

                $tasks = array_map(
                    function (Model\LabelingTask $task) {
                        $video = $this->videoFacade->find($task->getVideoId());

                        return array(
                            'videoName' => $video->getName(),
                            'date'      => $task->getCreatedAt(),
                        );
                    },
                    $tasks
                );

                $this->assertEquals(
                    $tasks,
                    $tasksByState
                );
            } else {
                foreach ($tasksByState as $expectedStatus => $expectedTasks) {
                    $tasks = $this->labelingTaskFacade->findAllByStatusAndProject(
                        $expectedStatus,
                        $project,
                        null,
                        null,
                        $expectedPhase
                    )->toArray();
                    $tasks = array_map(
                        function (Model\LabelingTask $task) {
                            $video = $this->videoFacade->find($task->getVideoId());

                            return array(
                                'videoName' => $video->getName(),
                                'date'      => $task->getCreatedAt(),
                            );
                        },
                        $tasks
                    );

                    $this->assertEquals(
                        $tasks,
                        $expectedTasks
                    );
                }
            }
        }
    }

    public function testGetLabeledFrame()
    {
        $video   = Model\Video::create('foobar');
        $project = Model\Project::create('test project');
        $task    = Model\LabelingTask::create(
            $video,
            $project,
            range(10, 20),
            Model\LabelingTask::TYPE_OBJECT_LABELING,
            null,
            array(),
            array(),
            new \DateTime('2016-05-03 12:01:00')
        );

        $newLabeledFrame = new Model\LabeledFrame($task, 0);
        $this->labeledFrameFacade->save($newLabeledFrame);

        $labeledFrame = $this->labelingTaskFacade->getLabeledFrame($task, 0);

        $this->assertEquals($newLabeledFrame, $labeledFrame);
    }

    protected function setUpImplementation()
    {
        $this->videoFacade        = $this->getAnnostationService('database.facade.video');
        $this->projectFacade      = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledFrameFacade = $this->getAnnostationService('database.facade.labeled_frame');
    }
}
