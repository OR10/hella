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
     * Project constructor.
     *
     * @param Model\Project        $project
     * @param AppBundleFacade\User $userFacade
     */
    public function __construct(Model\Project $project, AppBundleFacade\User $userFacade)
    {
        $this->project    = $project;
        $this->userFacade = $userFacade;
    }

    public function getElement(\DOMDocument $document)
    {
        $project = $document->createElement('project');
        $project->setAttribute('id', $this->project->getId());
        $project->setAttribute('name', $this->project->getName());

        $state        = $document->createElement('phase', $this->project->getStatus());
        $description  = $document->createElement('description', 'foobar');
        $creationDate = $document->createElement('creation-date', $this->project->getCreationDateAsObject()->format('c'));
        $creationUser = $document->createElement('created-by-user');
        $creationUser->setAttribute(
            'username',
            $this->userFacade->getUserById($this->project->getUserId())->getUsername()
        );
        $creationUser->setAttribute('email', $this->userFacade->getUserById($this->project->getUserId())->getEmail());
        $dueDate          = $document->createElement('due-date', $this->project->getDueDate());
        $frameSkip        = $document->createElement('frame-skip', $this->project->getTaskVideoSettings()['frameSkip']);
        $startFrameNumber = $document->createElement(
            'start-frame',
            $this->project->getTaskVideoSettings()['startFrameNumber']
        );
        $splitEach        = $document->createElement('split-each', $this->project->getTaskVideoSettings()['splitEach']);

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