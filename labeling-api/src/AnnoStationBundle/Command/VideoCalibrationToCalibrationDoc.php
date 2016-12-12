<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;
use Doctrine\ODM\CouchDB;

class VideoCalibrationToCalibrationDoc extends Base
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    /**
     * @param Facade\Video           $videoFacade
     * @param Facade\CalibrationData $calibrationDataFacade
     */
    public function __construct(Facade\Video $videoFacade, Facade\CalibrationData $calibrationDataFacade)
    {
        parent::__construct();
        $this->videoFacade           = $videoFacade;
        $this->calibrationDataFacade = $calibrationDataFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:VideoCalibrationToCalibrationDoc');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $videos   = $this->videoFacade->findAll();
        $progress = new ProgressBar($output, count($videos));

        /** @var Model\Video $video */
        foreach ($videos as $video) {
            if ($video->getCalibration() !== null
                && $video->getRawCalibration() !== null
                && $video->getCalibrationId() === null
            ) {
                $pathinfo             = pathinfo($video->getName());
                $calibrationFileName  = sprintf('%s.csv', $pathinfo['filename']);
                $videoCalibrationData = $video->getCalibration();
                $calibrationData      = new Model\CalibrationData($calibrationFileName);

                $calibrationData->setRawCalibration($video->getRawCalibration());
                $calibrationData->setCameraMatrix($videoCalibrationData['cameraMatrix']);
                $calibrationData->setRotationMatrix($videoCalibrationData['rotationMatrix']);
                $calibrationData->setTranslation($videoCalibrationData['translation']);
                $calibrationData->setDistortionCoefficients($videoCalibrationData['distortionCoefficients']);
                $calibrationData = $this->calibrationDataFacade->save($calibrationData);

                $video->setCalibrationId($calibrationData->getId());
                $video->setRawCalibration(null);
                $video->setCameraMatrix(null);
                $video->setRotationMatrix(null);
                $video->setTranslation(null);
                $video->setDistortionCoefficients(null);

                $this->videoFacade->save($video);
            }

            $progress->advance();
        }
        $progress->finish();
    }
}
