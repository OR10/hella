<?php
namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Annotations\CheckPermissions;
use AppBundle\Response;
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
     * @var Service\TaskConfigurationXmlConverterFactory
     */
    private $configurationXmlConverterFactory;

    /**
     * @param Service\CurrentUserPermissions               $currentUserPermissions
     * @param Facade\TaskConfiguration                     $taskConfigurationFacade
     * @param Storage\TokenStorage                         $tokenStorage
     * @param Service\XmlValidator                         $xmlValidator
     * @param Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory
     */
    public function __construct(
        Service\CurrentUserPermissions $currentUserPermissions,
        Facade\TaskConfiguration $taskConfigurationFacade,
        Storage\TokenStorage $tokenStorage,
        Service\XmlValidator $xmlValidator,
        Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory
    ) {
        $this->currentUserPermissions           = $currentUserPermissions;
        $this->taskConfigurationFacade          = $taskConfigurationFacade;
        $this->tokenStorage                     = $tokenStorage;
        $this->xmlValidator                     = $xmlValidator;
        $this->configurationXmlConverterFactory = $configurationXmlConverterFactory;
    }

    /**
     * @Rest\Get("")
     *
     * @return View\View
     */
    public function listConfigurationsAction()
    {
        $user = $this->tokenStorage->getToken()->getUser();

        $taskConfigurations = $this->taskConfigurationFacade->getTaskConfigurationsByUser($user);

        return new View\View(
            new Response\SimpleTaskConfiguration($taskConfigurations)
        );
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

        $user = $this->tokenStorage->getToken()->getUser();
        $name = $request->get('name');
        if (count($this->taskConfigurationFacade->getTaskConfigurationsByUserAndName($user, $name)) > 0) {
            return View\View::create()
                ->setData(['error' => sprintf(
                    'A Task Configuration with the name %s already exists',
                    $name
                )])
                ->setStatusCode(409);
        }


        $xml = new \DOMDocument();
        $xml->load($request->files->get('file'));
        $errorMessage = $this->xmlValidator->validate($xml);
        if ($errorMessage !== null) {
            return View\View::create()
                ->setData(['error' => $errorMessage])
                ->setStatusCode(406);
        }

        $file    = $request->files->get('file');
        $xmlData = file_get_contents($file->getPathName());
        $user    = $this->tokenStorage->getToken()->getUser();

        $taskConfigurationXmlConverter = $this->configurationXmlConverterFactory->createConverter($xmlData);

        $taskConfiguration = new Model\TaskConfiguration(
            $name,
            $file->getClientOriginalName(),
            $file->getMimeType(),
            $xmlData,
            $user->getId(),
            $taskConfigurationXmlConverter->convertToJson()
        );

        $this->taskConfigurationFacade->save($taskConfiguration);

        return View\View::create()->setData(['result' => $taskConfiguration]);
    }
}
