<?php

namespace AppBundle\Tests\Helper;

/**
 * Builder to create expected csv rows for the project exporter.
 */
class ProjectExportCsvRowBuilder
{
    /**
     * @var int
     */
    private $frameNumber = 0;

    /**
     * @var string
     */
    private $labelClass;

    /**
     * @var int|string
     */
    private $positionX = 'null';

    /**
     * @var int|string
     */
    private $positionY = 'null';

    /**
     * @var int|string
     */
    private $width = 'null';

    /**
     * @var int|string
     */
    private $height = 'null';

    /**
     * @var int|string
     */
    private $occlusion = 'unknown';

    /**
     * @var int|string
     */
    private $truncation = 'unknown';

    /**
     * @var string|null
     */
    private $direction = null;

    /**
     * @var bool
     */
    private $hasCuboid = false;

    /**
     * @var array
     */
    private $vertex2d = [];

    /**
     * @var array
     */
    private $vertex3d = [];

    /**
     * @var array
     */
    private $customFields = [];

    /**
     * We declare a private constructor to enforce usage of factory methods and fluent interface.
     */
    private function __construct()
    {
    }

    /**
     * @return ProjectExportCsvRowBuilder
     */
    public static function create()
    {
        return new self();
    }

    /**
     * @param int $frameNumber
     *
     * @return ProjectExportCsvRowBuilder
     */
    public function withFrameNumber(int $frameNumber): ProjectExportCsvRowBuilder
    {
        $this->frameNumber = $frameNumber;

        return $this;
    }

    /**
     * @param string $labelClass
     *
     * @return ProjectExportCsvRowBuilder
     */
    public function withLabelClass(string $labelClass): ProjectExportCsvRowBuilder
    {
        $this->labelClass = $labelClass;

        return $this;
    }

    /**
     * @param $x
     * @param $y
     *
     * @return ProjectExportCsvRowBuilder
     */
    public function withPosition($x, $y): ProjectExportCsvRowBuilder
    {
        $this->positionX = $x;
        $this->positionY = $y;

        return $this;
    }

    /**
     * @param int|string $width
     * @param int|string $height
     *
     * @return ProjectExportCsvRowBuilder
     */
    public function withDimensions($width, $height): ProjectExportCsvRowBuilder
    {
        $this->width  = $width;
        $this->height = $height;

        return $this;
    }

    /**
     * @param int|string $occlusion
     *
     * @return ProjectExportCsvRowBuilder
     */
    public function withOcclusion($occlusion): ProjectExportCsvRowBuilder
    {
        $this->occlusion = $occlusion;

        return $this;
    }

    /**
     * @param int|string $truncation
     *
     * @return ProjectExportCsvRowBuilder
     */
    public function withTruncation($truncation): ProjectExportCsvRowBuilder
    {
        $this->truncation = $truncation;

        return $this;
    }

    /**
     * @param string|null $direction
     *
     * @return ProjectExportCsvRowBuilder
     */
    public function withDirection(string $direction = null): ProjectExportCsvRowBuilder
    {
        $this->direction = $direction;

        return $this;
    }

    /**
     * @return ProjectExportCsvRowBuilder
     */
    public function withCuboid(): ProjectExportCsvRowBuilder
    {
        $this->hasCuboid = true;

        return $this;
    }

    /**
     * @return ProjectExportCsvRowBuilder
     */
    public function withoutCuboid(): ProjectExportCsvRowBuilder
    {
        $this->hasCuboid = false;

        return $this;
    }

    /**
     * @param array $vertex2d
     *
     * @return ProjectExportCsvRowBuilder
     */
    public function withVertex2d(array $vertex2d): ProjectExportCsvRowBuilder
    {
        $this->vertex2d = $vertex2d;

        return $this;
    }

    /**
     * @return ProjectExportCsvRowBuilder
     */
    public function withEmptyVertex2d(): ProjectExportCsvRowBuilder
    {
        $this->vertex2d = array_fill(0, 8, ['x' => 'null', 'y' => 'null']);

        return $this;
    }

    /**
     * @param array $vertex3d
     *
     * @return ProjectExportCsvRowBuilder
     */
    public function withVertex3d(array $vertex3d): ProjectExportCsvRowBuilder
    {
        $this->vertex3d = $vertex3d;

        return $this;
    }

    /**
     * @return ProjectExportCsvRowBuilder
     */
    public function withEmptyVertex3d(): ProjectExportCsvRowBuilder
    {
        $this->vertex3d = array_fill(0, 8, ['x' => 'null', 'y' => 'null', 'z' => 'null']);

        return $this;
    }

    /**
     * @param array $customFields
     *
     * @return ProjectExportCsvRowBuilder
     */
    public function withCustomFields(array $customFields): ProjectExportCsvRowBuilder
    {
        $this->customFields = $customFields;

        return $this;
    }

    public function build()
    {
        $row = [
            'frame_number' => $this->frameNumber,
            'position_x'   => $this->positionX,
            'position_y'   => $this->positionY,
            'width'        => $this->width,
            'height'       => $this->height,
            'occlusion'    => $this->occlusion,
            'truncation'   => $this->truncation,
            'direction'    => $this->direction,
        ];

        if ($this->labelClass !== null) {
            $row['label_class'] = $this->labelClass;
        }

        if (!empty($this->customFields)) {
            $row = array_replace($row, $this->customFields);
        }

        if ($this->hasCuboid) {
            $row = array_replace(
                $row,
                [
                    'vertex_2d_0_x' => $this->vertex2d[0]['x'],
                    'vertex_2d_0_y' => $this->vertex2d[0]['y'],
                    'vertex_2d_1_x' => $this->vertex2d[1]['x'],
                    'vertex_2d_1_y' => $this->vertex2d[1]['y'],
                    'vertex_2d_2_x' => $this->vertex2d[2]['x'],
                    'vertex_2d_2_y' => $this->vertex2d[2]['y'],
                    'vertex_2d_3_x' => $this->vertex2d[3]['x'],
                    'vertex_2d_3_y' => $this->vertex2d[3]['y'],
                    'vertex_2d_4_x' => $this->vertex2d[4]['x'],
                    'vertex_2d_4_y' => $this->vertex2d[4]['y'],
                    'vertex_2d_5_x' => $this->vertex2d[5]['x'],
                    'vertex_2d_5_y' => $this->vertex2d[5]['y'],
                    'vertex_2d_6_x' => $this->vertex2d[6]['x'],
                    'vertex_2d_6_y' => $this->vertex2d[6]['y'],
                    'vertex_2d_7_x' => $this->vertex2d[7]['x'],
                    'vertex_2d_7_y' => $this->vertex2d[7]['y'],

                    'vertex_3d_0_x' => $this->vertex3d[0]['x'],
                    'vertex_3d_0_y' => $this->vertex3d[0]['y'],
                    'vertex_3d_0_z' => $this->vertex3d[0]['z'],
                    'vertex_3d_1_x' => $this->vertex3d[1]['x'],
                    'vertex_3d_1_y' => $this->vertex3d[1]['y'],
                    'vertex_3d_1_z' => $this->vertex3d[1]['z'],
                    'vertex_3d_2_x' => $this->vertex3d[2]['x'],
                    'vertex_3d_2_y' => $this->vertex3d[2]['y'],
                    'vertex_3d_2_z' => $this->vertex3d[2]['z'],
                    'vertex_3d_3_x' => $this->vertex3d[3]['x'],
                    'vertex_3d_3_y' => $this->vertex3d[3]['y'],
                    'vertex_3d_3_z' => $this->vertex3d[3]['z'],
                    'vertex_3d_4_x' => $this->vertex3d[4]['x'],
                    'vertex_3d_4_y' => $this->vertex3d[4]['y'],
                    'vertex_3d_4_z' => $this->vertex3d[4]['z'],
                    'vertex_3d_5_x' => $this->vertex3d[5]['x'],
                    'vertex_3d_5_y' => $this->vertex3d[5]['y'],
                    'vertex_3d_5_z' => $this->vertex3d[5]['z'],
                    'vertex_3d_6_x' => $this->vertex3d[6]['x'],
                    'vertex_3d_6_y' => $this->vertex3d[6]['y'],
                    'vertex_3d_6_z' => $this->vertex3d[6]['z'],
                    'vertex_3d_7_x' => $this->vertex3d[7]['x'],
                    'vertex_3d_7_y' => $this->vertex3d[7]['y'],
                    'vertex_3d_7_z' => $this->vertex3d[7]['z'],
                ]
            );
        }

        return $row;
    }

    /**
     * @return array
     */
    public function buildWithStringValues()
    {
        $row = $this->build();

        $row = array_map(
            function ($value) {
                return (string) $value;
            },
            $row
        );

        return $row;
    }
}
