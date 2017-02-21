<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use Doctrine\ODM\CouchDB;

class LabelingGroup
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * LabelingGroup constructor.
     *
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param string $id
     *
     * @return Model\LabelingGroup
     */
    public function find(string $id)
    {
        return $this->documentManager->find(Model\LabelingGroup::class, $id);
    }

    /**
     * @param Model\LabelingGroup $labelingGroup
     *
     * @return Model\LabelingGroup
     */
    public function save(Model\LabelingGroup $labelingGroup)
    {
        $this->documentManager->persist($labelingGroup);
        $this->documentManager->flush();

        return $labelingGroup;
    }

    /**
     * @param Model\LabelingGroup $labelingGroup
     *
     * @return Model\LabelingGroup
     */
    public function delete(Model\LabelingGroup $labelingGroup)
    {
        $this->documentManager->remove($labelingGroup);
        $this->documentManager->flush();

        return $labelingGroup;
    }

    /**
     * @return \Doctrine\CouchDB\View\Result
     */
    public function findAll()
    {
        return $this->documentManager
            ->createQuery('annostation_labeling_group', 'by_id')
            ->onlyDocs(true)
            ->execute();
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     *
     * @return \Doctrine\CouchDB\View\Result
     */
    public function findAllByCoordinator(AnnoStationBundleModel\Organisation $organisation, Model\User $user = null)
    {
        $query = $this->documentManager
            ->createQuery('annostation_labeling_group_by_organisation_and_coordinator_001', 'view')
            ->onlyDocs(true);

        if ($user instanceof Model\User) {
            $query->setKey([$organisation->getId(), $user->getId()]);
        } else {
            $query->setStartKey([$organisation->getId(), null])
                ->setEndKey([$organisation->getId(), []]);
        }

        return $query->execute();
    }

    /**
     * Find and retrieve all LabelingGroups a specific user is listed in as either Labeler or LabelCoordinator.
     *
     * @param Model\User $user
     *
     * @return Model\LabelingGroup[]
     */
    public function findAllByUser(Model\User $user): array
    {
        $resultSet = $this->documentManager
            ->createQuery('annostation_labeling_group_by_user_and_user_type_001', 'view')
            ->onlyDocs(true)
            ->setStartKey([$user->getId()])
            ->setEndKey([$user->getId(), []])
            ->execute();

        return $resultSet->toArray();
    }
}
