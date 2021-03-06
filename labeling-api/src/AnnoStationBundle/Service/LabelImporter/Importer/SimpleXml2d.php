<?php
namespace AnnoStationBundle\Service\LabelImporter\Importer;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\LabelImporter;
use AnnoStationBundle\Service\LabelImporter\EntityProvider;
use AnnoStationBundle\Database\Facade\LabeledThing;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;

class SimpleXml2d extends LabelImporter\Importer
{
    public function __construct(
        Service\TaskIncomplete $taskIncompleteService,
        LabeledThing\FacadeInterface $labeledThingFacade,
        LabeledThingInFrame\FacadeInterface $labeledThingInFrameFacade
    ) {
        parent::__construct($taskIncompleteService, $labeledThingFacade, $labeledThingInFrameFacade);
        $this->entityProvider            = new EntityProvider\Mapper(
            [
                'fields' => [
                    LabelImporter\Importer::ID           => [
                        'mapKey' => 'UUID',
                    ],
                    LabelImporter\Importer::FRAME_NUMBER => [
                        'mapKey' => 'FrameNumber',
                    ],
                    LabelImporter\Importer::POSITION_X   => [
                        'mapKey' => 'position_x',
                    ],
                    LabelImporter\Importer::POSITION_Y   => [
                        'mapKey' => 'position_y',
                    ],
                    LabelImporter\Importer::WIDTH        => [
                        'mapKey' => 'width',
                    ],
                    LabelImporter\Importer::HEIGHT       => [
                        'mapKey' => 'height',
                    ],
                    LabelImporter\Importer::CLASSES      => [
                        'mapKeyStart' => 6,
                    ],
                ],
            ]
        );
    }
}
