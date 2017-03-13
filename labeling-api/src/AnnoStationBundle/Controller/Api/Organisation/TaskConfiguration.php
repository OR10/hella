<?php
namespace AnnoStationBundle\Controller\Api\Organisation;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\CheckPermissions;
use AnnoStationBundle\Response;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\Authentication;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\View;
use AppBundle\Model\TaskConfiguration as TaskConfigurationModel;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Prefix("/api/organisation")
 * @Rest\Route(service="annostation.labeling_api.controller.api.organisation.task_configuration")
 *
 * @CloseSession
 */
class TaskConfiguration extends Controller\Base
{
    /**
     * @var Authentication\UserPermissions
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
    private $simpleXmlValidator;

    /**
     * @var Service\XmlValidator
     */
    private $requirementsXmlValidator;

    /**
     * @var Service\TaskConfigurationXmlConverterFactory
     */
    private $configurationXmlConverterFactory;

    /**
     * @var Service\Authorization
     */
    private $authorizationService;

    /**
     * @param Authentication\UserPermissions               $currentUserPermissions
     * @param Facade\TaskConfiguration                     $taskConfigurationFacade
     * @param Storage\TokenStorage                         $tokenStorage
     * @param Service\XmlValidator                         $simpleXmlValidator
     * @param Service\XmlValidator                         $requirementsXmlValidator
     * @param Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory
     * @param Service\Authorization                        $authorizationService
     */
    public function __construct(
        Authentication\UserPermissions $currentUserPermissions,
        Facade\TaskConfiguration $taskConfigurationFacade,
        Storage\TokenStorage $tokenStorage,
        Service\XmlValidator $simpleXmlValidator,
        Service\XmlValidator $requirementsXmlValidator,
        Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory,
        Service\Authorization $authorizationService
    ) {
        $this->currentUserPermissions           = $currentUserPermissions;
        $this->taskConfigurationFacade          = $taskConfigurationFacade;
        $this->tokenStorage                     = $tokenStorage;
        $this->simpleXmlValidator               = $simpleXmlValidator;
        $this->requirementsXmlValidator         = $requirementsXmlValidator;
        $this->configurationXmlConverterFactory = $configurationXmlConverterFactory;
        $this->authorizationService             = $authorizationService;
    }

    /**
     * @Rest\Get("/{organisation}/taskConfiguration")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\View
     */
    public function listConfigurationsAction(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        $user = $this->tokenStorage->getToken()->getUser();

        $taskConfigurations = $this->taskConfigurationFacade->getTaskConfigurationsByUser($organisation, $user);
        $taskConfigurations = array_filter(
            $taskConfigurations,
            function (Model\TaskConfiguration $taskConfiguration) {
                return $taskConfiguration instanceof Model\TaskConfiguration\RequirementsXml;
            }
        );

        return new View\View(
            new Response\SimpleTaskConfigurationList(array_values($taskConfigurations))
        );
    }

    /**
     * @Rest\Get("/{organisation}/taskConfiguration/{taskConfiguration}")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param TaskConfigurationModel              $taskConfiguration
     *
     * @return View\View
     */
    public function getTaskConfigurationAction(
        AnnoStationBundleModel\Organisation $organisation,
        Model\TaskConfiguration $taskConfiguration
    ) {
        /*
        $user = $this->tokenStorage->getToken()->getUser();

        if ($user->getId() !== $taskConfiguration->getUserId()) {
            throw new BadRequestHttpException();
        }
        */
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        return new View\View(
            new Response\SimpleTaskConfiguration($taskConfiguration)
        );
    }

    /**
     * @Rest\Get("/{organisation}/taskConfiguration/{taskConfiguration}/file")
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param TaskConfigurationModel              $taskConfiguration
     *
     * @return HttpFoundation\Response
     */
    public function getTaskConfigurationFileAction(
        AnnoStationBundleModel\Organisation $organisation,
        Model\TaskConfiguration $taskConfiguration
    ) {
        /*
        $user = $this->tokenStorage->getToken()->getUser();

        if ($user->getId() !== $taskConfiguration->getUserId()) {
            throw new BadRequestHttpException();
        }
        */
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);
        
        return new HttpFoundation\Response(
            $taskConfiguration->getRawData(),
            HttpFoundation\Response::HTTP_OK,
            [
                'Content-Type' => $taskConfiguration->getContentType(),
            ]
        );
    }

    /**
     * @Rest\Post("/{organisation}/taskConfiguration/requirements")
     *
     * @CheckPermissions({"canUploadTaskConfiguration"})
     *
     * @param HttpFoundation\Request              $request
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return \FOS\RestBundle\View\View
     */
    public function uploadRequirementsXmlFileAction(
        HttpFoundation\Request $request,
        AnnoStationBundleModel\Organisation $organisation
    ) {
        $this->authorizationService->denyIfOrganisationIsNotAccessable($organisation);

        if (!$request->files->has('file') || !$request->get('name')) {
            return View\View::create()
                ->setData(['error' => 'Invalid data'])
                ->setStatusCode(400);
        }

        $user = $this->tokenStorage->getToken()->getUser();
        $name = $request->get('name');
        if (count($this->taskConfigurationFacade->getTaskConfigurationsByUserAndName($organisation, $user, $name)) > 0) {
            return View\View::create()
                ->setData(['error' => sprintf(
                    'A Task Configuration with the name %s already exists',
                    $name
                )])
                ->setStatusCode(409);
        }

        $xml = new \DOMDocument();
        $xml->load($request->files->get('file'));
        $errorMessage = $this->requirementsXmlValidator->validateRelaxNg($xml);
        if ($errorMessage !== null) {
            return View\View::create()
                ->setData(['error' => $errorMessage])
                ->setStatusCode(406);
        }

        if (!$this->hasXmlUniqueIds($xml)) {
            return View\View::create()
                ->setData(['error' => 'Found duplicate IDs in XML file.'])
                ->setStatusCode(406);
        }

        $file    = $request->files->get('file');
        $xmlData = file_get_contents($file->getPathName());
        $user    = $this->tokenStorage->getToken()->getUser();

        $taskConfiguration = new TaskConfigurationModel\RequirementsXml(
            $organisation,
            $name,
            $file->getClientOriginalName(),
            $file->getMimeType(),
            $xmlData,
            $user->getId(),
            \json_encode([])
        );

        $this->taskConfigurationFacade->save($taskConfiguration);

        return View\View::create()->setData(['result' => $taskConfiguration]);
    }

    /**
     * @param \DOMDocument $xml
     *
     * @return bool
     */
    private function hasXmlUniqueIds(\DOMDocument $xml)
    {
        $xpath = new \DOMXPath($xml);
        $xpath->registerNamespace('x', 'http://weblabel.hella-aglaia.com/schema/requirements');

        $ids = [];
        foreach ($xpath->query('//x:requirements/x:thing|//x:requirements/x:group') as $thing) {
            $ids[] = $thing->getAttribute('id');
            foreach ($xpath->query('x:class', $thing) as $classNode) {
                if ($classNode->hasAttribute('ref')) {
                    continue;
                }
                $ids[] = $classNode->getAttribute('id');
                foreach ($xpath->query('x:value', $classNode) as $valueNode) {
                    $ids[] = $valueNode->getAttribute('id');
                    if ($xpath->query('x:class', $valueNode)->length > 0) {
                        $ids = array_merge(
                            $ids,
                            $this->getChildrenIds($xpath, $xpath->query('x:class', $valueNode))
                        );
                    }
                }
            }
        }

        return !(count(array_unique(array_diff_assoc($ids, array_unique($ids)))) > 0);
    }

    /**
     * @param $xpath
     * @param $children
     *
     * @return array
     */
    private function getChildrenIds($xpath, $children)
    {
        $ids = [];
        foreach ($children as $value) {
            if ($value->hasAttribute('ref')) {
                continue;
            }
            $ids[] = $value->getAttribute('id');
            foreach ($xpath->query('x:value', $value) as $valueNode) {
                $ids[] = $valueNode->getAttribute('id');
                if ($xpath->query('x:class', $valueNode)->length > 0) {
                    $ids = array_merge($ids, $this->getChildrenIds($xpath, $xpath->query('x:class', $valueNode)));
                }
            }
        }

        return $ids;
    }
}
