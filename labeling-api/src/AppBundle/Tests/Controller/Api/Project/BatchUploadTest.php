<?php

namespace AppBundle\Tests\Controller\Api\Project;

use AppBundle\Database;
use AppBundle\Model;
use AppBundle\Tests;
use Symfony\Component\HttpFoundation;

class BatchUploadTest extends Tests\WebTestCase
{
    const UPLOAD_CHUNK_ROUTE    = '/api/project/batchUpload/%s';
    const UPLOAD_COMPLETE_ROUTE = '/api/project/batchUpload/%s/complete';

    /**
     * @var Database\Facade\Project
     */
    private $projectFacade;

    /**
     * @var Model\Project
     */
    private $project;

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
        $project->addStatusHistory($this->defaultUser, new \DateTime('+1 minute'), Model\Project::STATUS_DONE);
        $this->projectFacade->save($project);

        $requestWrapper = $this->createRequest(self::UPLOAD_CHUNK_ROUTE, [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $response = $requestWrapper->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    protected function setUpImplementation()
    {
        $this->projectFacade = $this->getAnnostationService('database.facade.project');

        $this->createDefaultUser();
        $this->defaultUser->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);
    }

    private function createProject()
    {
        $this->project = new Model\Project('test project');

        $this->project->addLegacyTaskInstruction(
            Model\LabelingTask::INSTRUCTION_PERSON,
            Model\LabelingTask::DRAWING_TOOL_RECTANGLE
        );

        $this->project->setUserId($this->defaultUser->getId());

        return $this->projectFacade->save($this->project);
    }
}