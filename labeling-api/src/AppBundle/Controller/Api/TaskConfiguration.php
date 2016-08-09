<?php
namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\CheckPermissions;
use AppBundle\Controller;
use AppBundle\Service;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use \AppBundle\Model;
use \AppBundle\Database\Facade;

/**
 * @Rest\Prefix("/api/taskConfiguration")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task_configuration")
 *
 * @CloseSession
 */
class TaskConfiguration extends Controller\Base
{
    /**
     * @var Service\CurrentUserPermissions
     */
    private $currentUserPermissions;
    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * TaskConfiguration constructor
     */
    public function __construct(Service\CurrentUserPermissions $currentUserPermissions, Facade\TaskConfiguration $taskConfigurationFacade)
    {
        $this->currentUserPermissions = $currentUserPermissions;
        $this->taskConfigurationFacade = $taskConfigurationFacade;
    }

    /**
     * @Rest\Post("")
     *
     * @CheckPermissions({"canUploadTaskConfiguration"})
     *
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function uploadFileAction(HttpFoundation\Request $request)
    {
        if (!$request->files->has('file') || !$request->get('name')) {
            return View\View::create()
                ->setData(['error' => 'Invalid data'])
                ->setStatusCode(400);
        }

        $file = $request->files->get('file');
        $name = $request->get('name');

        $taskConfiguration = new Model\TaskConfiguration(
            $name,
            $file->getClientOriginalName(),
            $file->getMimeType(),
            file_get_contents($file->getPathName())
        );

        $this->taskConfigurationFacade->save($taskConfiguration);

        return View\View::create()->setData($taskConfiguration);
    }
}