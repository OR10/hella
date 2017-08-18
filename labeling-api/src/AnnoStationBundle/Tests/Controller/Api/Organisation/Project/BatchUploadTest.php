<?php

namespace AnnoStationBundle\Tests\Controller\Api\Organisation\Project;

use AnnoStationBundle\AnnoStationBundle;
use AnnoStationBundle\Database;
use AnnoStationBundle\Tests\Helper;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Tests;
use crosscan\WorkerPool\Facade;
use Symfony\Component\HttpFoundation;

class BatchUploadTest extends Tests\WebTestCase
{
    const UPLOAD_CHUNK_ROUTE = '/api/v1/organisation/%s/project/batchUpload/%s';
    const UPLOAD_COMPLETE_ROUTE = '/api/v1/organisation/%s/project/batchUpload/%s/complete';

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

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    public function testUploadIsForbiddenForLabelers()
    {
        $this->defaultUser->setRoles([Model\User::ROLE_LABELER]);

        $project        = $this->createProject($this->organisation);
        $requestWrapper = $this->createRequest(self::UPLOAD_CHUNK_ROUTE, [$this->organisation->getId(), $project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = $requestWrapper->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testUploadIsForbiddenIfUserIsNotAssignedToProject()
    {
        $project      = $this->createProject($this->organisation);
        $project->setUserId(null);
        $this->projectFacade->save($project);

        $requestWrapper = $this->createRequest(self::UPLOAD_CHUNK_ROUTE, [$this->organisation->getId(), $project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = $requestWrapper->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testUploadIsForbiddenIfProjectIsDone()
    {
        $project      = $this->createProject($this->organisation);
        $project->addStatusHistory(new \DateTime('+1 minute'), Model\Project::STATUS_DONE, $this->defaultUser);
        $this->projectFacade->save($project);

        $requestWrapper = $this->createRequest(self::UPLOAD_CHUNK_ROUTE, [$this->organisation->getId(), $project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = $requestWrapper->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testCompleteVideoRoute()
    {
        $project      = $this->createProject($this->organisation);
        $video        = Helper\VideoBuilder::create($this->organisation)->build();
        $this->videoFacade->save($video);

        $project->addVideo($video);

        $requestWrapper = $this->createRequest(self::UPLOAD_COMPLETE_ROUTE, [$this->organisation->getId(), $project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = json_decode($requestWrapper->getResponse()->getContent(), true);

        $this->assertEquals(1, count($response['result']['taskIds']));
        $this->assertEquals(0, count($response['result']['missing3dVideoCalibrationData']));
    }

    public function testCompleteVideoRouteWithCalibrationData()
    {
        $calibrationData = new Model\CalibrationData($this->organisation, 'foobar.csv');
        $this->calibrationDataFacade->save($calibrationData);

        $video        = Helper\VideoBuilder::create($this->organisation)->withName('foobar.avi')->build();
        $this->videoFacade->save($video);

        $project = Helper\ProjectBuilder::create($this->organisation)->withLegacyTaskInstruction(
            [
                [
                    'instruction' => Model\LabelingTask::INSTRUCTION_VEHICLE,
                    'drawingTool' => Model\LabelingTask::DRAWING_TOOL_CUBOID,
                ],
            ]
        )->withVideo($video)->withCalibrationData($calibrationData)->build();
        $this->projectFacade->save($project);

        $requestWrapper = $this->createRequest(self::UPLOAD_COMPLETE_ROUTE, [$this->organisation->getId(), $project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = json_decode($requestWrapper->getResponse()->getContent(), true);

        $this->assertEquals(1, count($response['result']['taskIds']));
        $this->assertEquals(0, count($response['result']['missing3dVideoCalibrationData']));
    }

    public function testCompleteVideoRouteWithMissingCalibrationData()
    {
        $project      = $this->createProject($this->organisation);
        $project->addLegacyTaskInstruction(
            Model\LabelingTask::INSTRUCTION_VEHICLE,
            Model\LabelingTask::DRAWING_TOOL_CUBOID
        );
        $video = Helper\VideoBuilder::create($this->organisation)->build();
        $this->videoFacade->save($video);

        $project->addVideo($video);

        $requestWrapper = $this->createRequest(self::UPLOAD_COMPLETE_ROUTE, [$this->organisation->getId(), $project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = json_decode($requestWrapper->getResponse()->getContent(), true);

        $this->assertEquals(0, count($response['result']['taskIds']));
        $this->assertEquals(1, count($response['result']['missing3dVideoCalibrationData']));
    }

    protected function setUpImplementation()
    {
        $this->projectFacade = $this->getAnnostationService('database.facade.project');
        $this->videoFacade = $this->getAnnostationService('database.facade.video');
        $this->calibrationDataFacade = $this->getAnnostationService('database.facade.calibration_data');
        $organisationFacade = $this->getAnnostationService('database.facade.organisation');
        $this->organisation = $organisationFacade->save(
            Tests\Helper\OrganisationBuilder::create()->build()
        );

        $this->createDefaultUser();
        $this->defaultUser->setRoles([Model\User::ROLE_LABEL_MANAGER]);
        $this->defaultUser->assignToOrganisation($this->organisation);
    }

    private function createProject(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->project = Helper\ProjectBuilder::create($organisation)
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
