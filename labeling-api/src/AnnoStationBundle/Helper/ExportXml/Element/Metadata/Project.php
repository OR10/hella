<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model;
use AppBundle\Database\Facade as AppBundleFacade;

class Project extends ExportXml\Element
{
    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var AppBundleFacade\User
     */
    private $userFacade;

    /**
     * @var string
     */
    private $namespace;

    /**
     * Project constructor.
     *
     * @param Model\Project        $project
     * @param AppBundleFacade\User $userFacade
     */
    public function __construct(Model\Project $project, AppBundleFacade\User $userFacade, $namespace)
    {
        $this->project    = $project;
        $this->userFacade = $userFacade;
        $this->namespace  = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $project = $document->createElementNS($this->namespace, 'project');
        $project->setAttribute('id', $this->project->getId());
        $project->setAttribute('name', $this->project->getName());

        $state        = $document->createElementNS($this->namespace, 'phase', $this->project->getStatus());
        $description  = $document->createElementNS($this->namespace, 'description', $this->project->getDescription());
        $creationDate = $document->createElementNS($this->namespace, 'creation-date', $this->project->getCreationDateAsObject()->format('c'));
        $creationUser = $document->createElementNS($this->namespace, 'created-by-user');
        $creationUser->setAttribute(
            'username',
            $this->userFacade->getUserById($this->project->getUserId())->getUsername()
        );
        $creationUser->setAttribute('email', $this->userFacade->getUserById($this->project->getUserId())->getEmail());
        $dueDate          = $document->createElementNS($this->namespace, 'due-date', $this->project->getDueDate());
        $frameSkip        = $document->createElementNS($this->namespace, 'frame-skip', $this->project->getTaskVideoSettings()['frameSkip']);
        $startFrameNumber = $document->createElementNS(
            $this->namespace,
            'start-frame',
            $this->project->getTaskVideoSettings()['startFrameNumber']
        );
        $splitEach        = $document->createElementNS($this->namespace, 'split-each', $this->project->getTaskVideoSettings()['splitEach']);

        $project->appendChild($state);
        $project->appendChild($description);
        $project->appendChild($creationDate);
        $project->appendChild($creationUser);
        $project->appendChild($dueDate);
        $project->appendChild($frameSkip);
        $project->appendChild($startFrameNumber);
        $project->appendChild($splitEach);

        return $project;
    }
}