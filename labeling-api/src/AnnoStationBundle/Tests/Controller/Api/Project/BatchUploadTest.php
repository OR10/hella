<?php

namespace AnnoStationBundle\Tests\Controller\Api\Project;

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
    const UPLOAD_CHUNK_ROUTE = '/api/organisation/%s/project/batchUpload/%s';
    const UPLOAD_COMPLETE_ROUTE = '/api/organisation/%s/project/batchUpload/%s/complete';

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
     * @var Database\Facade\Organisation
     */
    private $organisationFacade;

    public function testUploadIsForbiddenForLabelers()
    {
        $this->defaultUser->setRoles([Model\User::ROLE_LABELER]);

        $organisation   = $this->createOrganisation();
        $project        = $this->createProject($organisation);
        $requestWrapper = $this->createRequest(self::UPLOAD_CHUNK_ROUTE, [$organisation->getId(), $project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = $requestWrapper->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testUploadIsForbiddenIfUserIsNotAssignedToProject()
    {
        $this->defaultUser->setRoles([Model\User::ROLE_CLIENT]);

        $organisation = $this->createOrganisation();
        $project      = $this->createProject($organisation);
        $project->setUserId(null);
        $this->projectFacade->save($project);

        $requestWrapper = $this->createRequest(self::UPLOAD_CHUNK_ROUTE, [$organisation->getId(), $project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = $requestWrapper->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testUploadIsForbiddenIfProjectIsDone()
    {
        $organisation = $this->createOrganisation();
        $project      = $this->createProject($organisation);
        $project->addStatusHistory(new \DateTime('+1 minute'), Model\Project::STATUS_DONE, $this->defaultUser);
        $this->projectFacade->save($project);

        $requestWrapper = $this->createRequest(self::UPLOAD_CHUNK_ROUTE, [$organisation->getId(), $project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = $requestWrapper->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testCompleteVideoRoute()
    {
        $organisation = $this->createOrganisation();
        $project      = $this->createProject($organisation);
        $video        = Helper\VideoBuilder::create($organisation)->build();
        $this->videoFacade->save($video);

        $project->addVideo($video);

        $requestWrapper = $this->createRequest(self::UPLOAD_COMPLETE_ROUTE, [$organisation->getId(), $project->getId()])
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

        $organisation = $this->createOrganisation();
        $video        = Helper\VideoBuilder::create($organisation)->withName('foobar.avi')->build();
        $this->videoFacade->save($video);

        $project = Helper\ProjectBuilder::create($organisation)->withLegacyTaskInstruction(
            [
                [
                    'instruction' => Model\LabelingTask::INSTRUCTION_VEHICLE,
                    'drawingTool' => Model\LabelingTask::DRAWING_TOOL_CUBOID,
                ],
            ]
        )->withVideo($video)->withCalibrationData($calibrationData)->build();
        $this->projectFacade->save($project);

        $requestWrapper = $this->createRequest(self::UPLOAD_COMPLETE_ROUTE, [$organisation->getId(), $project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = json_decode($requestWrapper->getResponse()->getContent(), true);

        $this->assertEquals(1, count($response['result']['taskIds']));
        $this->assertEquals(0, count($response['result']['missing3dVideoCalibrationData']));
    }

    public function testCompleteVideoRouteWithMissingCalibrationData()
    {
        $organisation = $this->createOrganisation();
        $project      = $this->createProject($organisation);
        $project->addLegacyTaskInstruction(
            Model\LabelingTask::INSTRUCTION_VEHICLE,
            Model\LabelingTask::DRAWING_TOOL_CUBOID
        );
        $video = Helper\VideoBuilder::create($organisation)->build();
        $this->videoFacade->save($video);

        $project->addVideo($video);

        $requestWrapper = $this->createRequest(self::UPLOAD_COMPLETE_ROUTE, [$organisation->getId(), $project->getId()])
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
        $this->organisationFacade    = $this->getAnnostationService('database.facade.organisation');

        $this->createDefaultUser();
        $this->defaultUser->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);
    }

    private function createOrganisation()
    {
        return $this->organisationFacade->save(Tests\Helper\OrganisationBuilder::create()->build());
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
