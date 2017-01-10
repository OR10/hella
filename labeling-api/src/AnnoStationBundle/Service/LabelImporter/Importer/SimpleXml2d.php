<?php
namespace AnnoStationBundle\Service\LabelImporter\Importer;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\LabelImporter;
use AnnoStationBundle\Service\LabelImporter\EntityProvider;

class SimpleXml2d extends LabelImporter\Importer
{
    public function __construct(
        Service\TaskIncomplete $taskIncompleteService,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledThing $labeledThingFacade
    ) {
        parent::__construct($taskIncompleteService, $labeledThingInFrameFacade, $labeledThingFacade);
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