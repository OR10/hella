<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabelingPrediction
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * LabelingTask constructor.
     *
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param Model\LabelingPrediction $project
     * @return Model\LabelingPrediction
     */
    public function save(Model\LabelingPrediction $project)
    {
        $this->documentManager->persist($project);
        $this->documentManager->flush();

        return $project;
    }

    /**
     * @param $id
     * @return object
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\LabelingPrediction::class, $id);
    }

    public function update()
    {
        $this->documentManager->flush();
    }

    /**
     * @param Model\Project $project
     */
    public function delete(Model\LabelingPrediction $project)
    {
        $this->documentManager->remove($project);
        $this->documentManager->flush();
    }

    /**
     * @param Model\LabelingTask $task
     * @param Model\Project $project
     * @return mixed
     */
    public function findByTaskProject(Model\LabelingTask $task)
    {
        return $this->documentManager
            ->createQuery('annostation_labeling_prediction', 'by_taskid')
            ->setKey($task->getId())
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }
}
