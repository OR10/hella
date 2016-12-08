<?php

namespace AnnoStationBundle\Tests\Controller\Api\Project;

use AnnoStationBundle\Database;
use AnnoStationBundle\Tests\Helper;
use AppBundle\Model;
use AnnoStationBundle\Tests;
use Symfony\Component\HttpFoundation;

class BatchUploadTest extends Tests\WebTestCase
{
    const UPLOAD_CHUNK_ROUTE = '/api/project/batchUpload/%s';
    const UPLOAD_COMPLETE_ROUTE = '/api/project/batchUpload/%s/complete';

    /**
     * @var Database\Facade\Project
     */
    private $projectFacade;

    /**
     * @var Database\Facade\Video
     */
    private $videoFacade;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Database\Facade\CalibrationData
     */
    private $calibrationDataFacade;

    public function testUploadIsForbiddenForLabelers()
    {
        $this->defaultUser->setRoles([Model\User::ROLE_LABELER]);

        $project        = $this->createProject();
        $requestWrapper = $this->createRequest(self::UPLOAD_CHUNK_ROUTE, [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = $requestWrapper->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testUploadIsForbiddenIfUserIsNotAssignedToProject()
    {
        $this->defaultUser->setRoles([Model\User::ROLE_CLIENT]);

        $project = $this->createProject();
        $project->setUserId(null);
        $this->projectFacade->save($project);

        $requestWrapper = $this->createRequest(self::UPLOAD_CHUNK_ROUTE, [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = $requestWrapper->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testUploadIsForbiddenIfProjectIsDone()
    {
        $project = $this->createProject();
        $project->addStatusHistory(new \DateTime('+1 minute'), Model\Project::STATUS_DONE, $this->defaultUser);
        $this->projectFacade->save($project);

        $requestWrapper = $this->createRequest(self::UPLOAD_CHUNK_ROUTE, [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = $requestWrapper->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testCompleteVideoRoute()
    {
        $project = $this->createProject();
        $video = Helper\VideoBuilder::create()->build();
        $this->videoFacade->save($video);

        $project->addVideo($video);

        $requestWrapper = $this->createRequest(self::UPLOAD_COMPLETE_ROUTE, [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = json_decode($requestWrapper->getResponse()->getContent(), true);

        $this->assertEquals(1, count($response['result']['taskIds']));
        $this->assertEquals(0, count($response['result']['missing3dVideoCalibrationData']));
    }

    public function testCompleteVideoRouteWithCalibrationData()
    {
        $calibrationData = new Model\CalibrationData('foobar.csv');
        $this->calibrationDataFacade->save($calibrationData);

        $video = Helper\VideoBuilder::create()->withName('foobar.avi')->build();
        $this->videoFacade->save($video);

        $project = Helper\ProjectBuilder::create()->withLegacyTaskInstruction(
            [
                [
                    'instruction' => Model\LabelingTask::INSTRUCTION_VEHICLE,
                    'drawingTool' => Model\LabelingTask::DRAWING_TOOL_CUBOID,
                ],
            ]
        )->withVideo($video)->withCalibrationData($calibrationData)->build();
        $this->projectFacade->save($project);

        $requestWrapper = $this->createRequest(self::UPLOAD_COMPLETE_ROUTE, [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = json_decode($requestWrapper->getResponse()->getContent(), true);

        $this->assertEquals(1, count($response['result']['taskIds']));
        $this->assertEquals(0, count($response['result']['missing3dVideoCalibrationData']));
    }

    public function testCompleteVideoRouteWithMissingCalibrationData()
    {
        $project = $this->createProject();
        $project->addLegacyTaskInstruction(
            Model\LabelingTask::INSTRUCTION_VEHICLE,
            Model\LabelingTask::DRAWING_TOOL_CUBOID
        );
        $video = Helper\VideoBuilder::create()->build();
        $this->videoFacade->save($video);

        $project->addVideo($video);

        $requestWrapper = $this->createRequest(self::UPLOAD_COMPLETE_ROUTE, [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = json_decode($requestWrapper->getResponse()->getContent(), true);

        $this->assertEquals(0, count($response['result']['taskIds']));
        $this->assertEquals(1, count($response['result']['missing3dVideoCalibrationData']));
    }

    protected function setUpImplementation()
    {
        $this->projectFacade         = $this->getAnnostationService('database.facade.project');
        $this->videoFacade           = $this->getAnnostationService('database.facade.video');
        $this->calibrationDataFacade = $this->getAnnostationService('database.facade.calibration_data');

        $this->createDefaultUser();
        $this->defaultUser->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);
    }

    private function createProject()
    {
        $this->project = Helper\ProjectBuilder::create()
            ->withLegacyTaskInstruction(
                [
                    [
                        'instruction' => Model\LabelingTask::INSTRUCTION_PERSON,
                        'drawingTool' => Model\LabelingTask::DRAWING_TOOL_RECTANGLE,

                    ],
                ]
            )->withProjectOwnedByUserId($this->defaultUser->getId())->build();

        return $this->projectFacade->save($this->project);
    }
}
