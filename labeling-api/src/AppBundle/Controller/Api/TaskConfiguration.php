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
use Symfony\Component\Security\Core\Authentication\Token\Storage;

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
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @var Service\XmlValidator
     */
    private $xmlValidator;

    /**
     * @param Service\CurrentUserPermissions $currentUserPermissions
     * @param Facade\TaskConfiguration       $taskConfigurationFacade
     * @param Storage\TokenStorage           $tokenStorage
     * @param Service\XmlValidator           $xmlValidator
     */
    public function __construct(
        Service\CurrentUserPermissions $currentUserPermissions,
        Facade\TaskConfiguration $taskConfigurationFacade,
        Storage\TokenStorage $tokenStorage,
        Service\XmlValidator $xmlValidator
    ) {
        $this->currentUserPermissions  = $currentUserPermissions;
        $this->taskConfigurationFacade = $taskConfigurationFacade;
        $this->tokenStorage            = $tokenStorage;
        $this->xmlValidator            = $xmlValidator;
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

        $xml = new \DOMDocument();
        $xml->load($request->files->get('file'));
        $errorMessage = $this->xmlValidator->validate($xml);
        if ($errorMessage !== null) {
            return View\View::create()
                ->setData(['error' => $errorMessage])
                ->setStatusCode(400);
        }

        $file = $request->files->get('file');
        $name = $request->get('name');
        $user = $this->tokenStorage->getToken()->getUser();

        $taskConfiguration = new Model\TaskConfiguration(
            $name,
            $file->getClientOriginalName(),
            $file->getMimeType(),
            file_get_contents($file->getPathName()),
            $user->getId()
        );

        $this->taskConfigurationFacade->save($taskConfiguration);

        return View\View::create()->setData(['result' => $taskConfiguration]);
    }
}