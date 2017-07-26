<?php
namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;

class RequirementsXml
{
    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * RequirementsXml constructor.
     *
     * @param Facade\TaskConfiguration $taskConfigurationFacade
     */
    public function __construct(Facade\TaskConfiguration $taskConfigurationFacade)
    {
        $this->taskConfigurationFacade = $taskConfigurationFacade;
    }
    /**
     * @param Model\TaskConfiguration $taskConfiguration
     *
     * @return Model\TaskConfiguration
     */
    public function save(Model\TaskConfiguration $taskConfiguration)
    {
        return $this->taskConfigurationFacade->save($taskConfiguration);
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     * @param                                     $name
     * @param                                     $filename
     * @param                                     $md5Hash
     *
     * @return mixed
     */
    public function getTaskConfigurationByUserAndMd5Hash(
        AnnoStationBundleModel\Organisation $organisation,
        Model\User $user,
        $name,
        $filename,
        $md5Hash
    ) {
        return $this->taskConfigurationFacade->getTaskConfigurationByUserAndMd5Hash(
            $organisation,
            $user,
            $name,
            $filename,
            $md5Hash
        );
    }
}
