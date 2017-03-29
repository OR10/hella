<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;

class ReplicationTest extends Tests\WebTestCase
{
    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Model\User
     */
    private $admin;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\Video
     */
    private $video;

    public function testGetReplicationForTask()
    {
        $response = $this->createRequest('/api/task/%s/replication', [$this->task->getId()])
            ->withCredentialsFromUsername($this->admin)
            ->execute()
            ->getResponse();

        $client = static::createClient();

        $databaseName   = sprintf('taskdb-project-%s-task-%s', $this->project->getId(), $this->task->getId());
        $databaseServer = $client->getKernel()->getContainer()->getParameter('couchdb_external_url');

        $expectedResponse = [
            'result' => [
                'taskId'         => $this->task->getId(),
                'databaseName'   => $databaseName,
                'databaseServer' => $databaseServer,
            ],
        ];

        $this->assertEquals($expectedResponse, json_decode($response->getContent(), true));
    }

    protected function setUpImplementation()
    {
        $organisationFacade = $this->getAnnostationService('database.facade.organisation');
        $videoFacade        = $this->getAnnostationService('database.facade.video');
        $projectFacade      = $this->getAnnostationService('database.facade.project');
        $taskFacade         = $this->getAnnostationService('database.facade.labeling_task');

        $organisation = $organisationFacade->save(Tests\Helper\OrganisationBuilder::create()->build());
        $this->admin  = $this->createAdminUser($organisation);

        $this->project = $projectFacade->save(Tests\Helper\ProjectBuilder::create($organisation)->build());
        $this->video   = $videoFacade->save(Tests\Helper\VideoBuilder::create($organisation)->build());
        $this->task    = $taskFacade->save(
            Tests\Helper\LabelingTaskBuilder::create($this->project, $this->video)->build()
        );
    }
}
