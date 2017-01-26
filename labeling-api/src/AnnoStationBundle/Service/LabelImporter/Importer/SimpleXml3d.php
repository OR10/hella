<?php
namespace AnnoStationBundle\Service\LabelImporter\Importer;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\LabelImporter;
use AnnoStationBundle\Service\LabelImporter\EntityProvider;

class SimpleXml3d extends LabelImporter\Importer
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
                    self::ID           => [
                        'mapKey' => 'UUID',
                    ],
                    self::FRAME_NUMBER => [
                        'mapKey' => 'FrameNumber',
                    ],
                    self::VERTEX_3D_0_X => [
                        'mapKey' => 'vertex_3d_0_x'
                    ],
                    self::VERTEX_3D_0_Y => [
                        'mapKey' => 'vertex_3d_0_y'
                    ],
                    self::VERTEX_3D_0_Z => [
                        'mapKey' => 'vertex_3d_0_z'
                    ],
                    self::VERTEX_3D_1_X => [
                        'mapKey' => 'vertex_3d_1_x'
                    ],
                    self::VERTEX_3D_1_Y => [
                        'mapKey' => 'vertex_3d_1_y'
                    ],
                    self::VERTEX_3D_1_Z => [
                        'mapKey' => 'vertex_3d_1_z'
                    ],
                    self::VERTEX_3D_2_X => [
                        'mapKey' => 'vertex_3d_2_x'
                    ],
                    self::VERTEX_3D_2_Y => [
                        'mapKey' => 'vertex_3d_2_y'
                    ],
                    self::VERTEX_3D_2_Z => [
                        'mapKey' => 'vertex_3d_2_z'
                    ],
                    self::VERTEX_3D_3_X => [
                        'mapKey' => 'vertex_3d_3_x'
                    ],
                    self::VERTEX_3D_3_Y => [
                        'mapKey' => 'vertex_3d_3_y'
                    ],
                    self::VERTEX_3D_3_Z => [
                        'mapKey' => 'vertex_3d_3_z'
                    ],
                    self::VERTEX_3D_4_X => [
                        'mapKey' => 'vertex_3d_4_x'
                    ],
                    self::VERTEX_3D_4_Y => [
                        'mapKey' => 'vertex_3d_4_y'
                    ],
                    self::VERTEX_3D_4_Z => [
                        'mapKey' => 'vertex_3d_4_z'
                    ],
                    self::VERTEX_3D_5_X => [
                        'mapKey' => 'vertex_3d_5_x'
                    ],
                    self::VERTEX_3D_5_Y => [
                        'mapKey' => 'vertex_3d_5_y'
                    ],
                    self::VERTEX_3D_5_Z => [
                        'mapKey' => 'vertex_3d_5_z'
                    ],
                    self::VERTEX_3D_6_X => [
                        'mapKey' => 'vertex_3d_6_x'
                    ],
                    self::VERTEX_3D_6_Y => [
                        'mapKey' => 'vertex_3d_6_y'
                    ],
                    self::VERTEX_3D_6_Z => [
                        'mapKey' => 'vertex_3d_6_z'
                    ],
                    self::VERTEX_3D_7_X => [
                        'mapKey' => 'vertex_3d_7_x'
                    ],
                    self::VERTEX_3D_7_Y => [
                        'mapKey' => 'vertex_3d_7_y'
                    ],
                    self::VERTEX_3D_7_Z => [
                        'mapKey' => 'vertex_3d_7_z'
                    ],
                    self::CLASSES      => [
                        'mapKeyStart' => 42,
                    ],
                ],
            ]
        );
    }
}
