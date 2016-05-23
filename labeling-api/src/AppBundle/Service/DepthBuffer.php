<?php

namespace AppBundle\Service;

use AppBundle\Helper\Matrix;
use AppBundle\Model;
use AppBundle\Model\Shapes;

class DepthBuffer
{
    /**
     * @var MatrixProjection
     */
    private $matrixProjection;

    /**
     * DepthBuffer constructor.
     * @param MatrixProjection $matrixProjection
     */
    public function __construct(MatrixProjection $matrixProjection)
    {
        $this->matrixProjection = $matrixProjection;
    }

    public function projectCuboidTo2d(Shapes\Cuboid3d $cuboid3d, $calibrationData)
    {
        $facesWithDepth = $this->getVertices($cuboid3d, $calibrationData);

        return new Shapes\Cuboid2d(
            null,
            $facesWithDepth[0][0],
            $facesWithDepth[0][1],
            $facesWithDepth[0][2],
            $facesWithDepth[0][3],
            $facesWithDepth[0][4],
            $facesWithDepth[0][5],
            $facesWithDepth[0][6],
            $facesWithDepth[0][7]
        );
    }

    public function getVertices(Shapes\Cuboid3d $cuboid3d, $calibrationData)
    {
        $projection = array_map(function ($vertex) use ($calibrationData) {
            return $this->matrixProjection->project3dTo2d($vertex, $calibrationData);
        }, $cuboid3d->getVertices()
        );

        $cuboid2dWithoutDepth = new Shapes\Cuboid2d(
            null,
            $projection[0]->toArray(),
            $projection[1]->toArray(),
            $projection[2]->toArray(),
            $projection[3]->toArray(),
            $projection[4]->toArray(),
            $projection[5]->toArray(),
            $projection[6]->toArray(),
            $projection[7]->toArray()
        );
        $faces = $this->getFacesForCuboid($cuboid2dWithoutDepth, $cuboid3d);

        usort($faces, function ($faceA, $faceB) {
            $maxDepthFaceA = max(
                array_map(function ($vertices3d) {
                    return $vertices3d->getX();
                }, $faceA['vertices3d']
                )
            );
            $maxDepthFaceB = max(
                array_map(function ($vertices3d) {
                    return $vertices3d->getX();
                }, $faceB['vertices3d']
                )
            );
            if ($maxDepthFaceA < $maxDepthFaceB) {
                return -1;
            } else if ($maxDepthFaceA === $maxDepthFaceB) {
                return 0;
            } else {
                return 1;
            }
        });

        return $this->projectFacesWithDepth($faces);
    }

    private function getFacesForCuboid(Shapes\Cuboid2d $cuboid2d, Shapes\Cuboid3d $cuboid3d)
    {
        $c2 = $cuboid2d->getVertices();
        $c3 = $cuboid3d->getVertices();

        $faces = array();

        $faces[] = [
            'name' => 'front',
            'vertices2d' => [$c2[0], $c2[1], $c2[2], $c2[3]],
            'vertices3d' => [$c3[0], $c3[1], $c3[2], $c3[3]],
            'order' => [0, 1, 2, 3],
        ];
        $faces[] = [
            'name' => 'back',
            'vertices2d' => [$c2[4], $c2[5], $c2[6], $c2[7]],
            'vertices3d' => [$c3[4], $c3[5], $c3[6], $c3[7]],
            'order' => [4, 5, 6, 7],
        ];
        $faces[] = [
            'name' => 'left',
            'vertices2d' => [$c2[4], $c2[0], $c2[3], $c2[7]],
            'vertices3d' => [$c3[4], $c3[0], $c3[3], $c3[7]],
            'order' => [4, 0, 3, 7],
        ];
        $faces[] = [
            'name' => 'right',
            'vertices2d' => [$c2[5], $c2[1], $c2[2], $c2[6]],
            'vertices3d' => [$c3[5], $c3[1], $c3[2], $c3[6]],
            'order' => [5, 1, 2, 6],
        ];
        $faces[] = [
            'name' => 'top',
            'vertices2d' => [$c2[4], $c2[0], $c2[1], $c2[5]],
            'vertices3d' => [$c3[4], $c3[0], $c3[1], $c3[5]],
            'order' => [4, 0, 1, 5],
        ];
        $faces[] = [
            'name' => 'bottom',
            'vertices2d' => [$c2[7], $c2[6], $c2[2], $c2[0]],
            'vertices3d' => [$c3[7], $c3[6], $c3[2], $c3[0]],
            'order' => [7, 6, 2, 0],
        ];

        return $faces;
    }

    private function projectFacesWithDepth($faces)
    {
        $minMaxFaces2d = [
            'x' => [
                'min' => INF,
                'max' => -INF,
            ],
            'y' => [
                'min' => INF,
                'max' => -INF,
            ],
        ];

        foreach ($faces as $face) {
            foreach ($face['vertices2d'] as $vertices2d) {
                $minMaxFaces2d['x']['min'] = min($minMaxFaces2d['x']['min'], $vertices2d->getX());
                $minMaxFaces2d['x']['max'] = max($minMaxFaces2d['x']['max'], $vertices2d->getX());
                $minMaxFaces2d['y']['min'] = min($minMaxFaces2d['y']['min'], $vertices2d->getY());
                $minMaxFaces2d['y']['max'] = max($minMaxFaces2d['y']['max'], $vertices2d->getY());
            }
        }

        $offsetX = $minMaxFaces2d['x']['min'] * -1;
        $offsetY = $minMaxFaces2d['y']['min'] * -1;

        $imageWidth = $minMaxFaces2d['x']['max'] - $minMaxFaces2d['x']['min'];
        $imageHeight = $minMaxFaces2d['y']['max'] - $minMaxFaces2d['y']['min'];


        $image = \imagecreatetruecolor(round($imageWidth), round($imageHeight));
        $black = imagecolorallocate($image, 0, 0, 0);
        $white = imagecolorallocate($image, 255, 255, 255);

        imagefill($image, 0, 0, $black);


        $vertices = array();
        $vertexVisibility = array();
        foreach ($faces as $face) {
            $hiddenVertices = array_filter($face['vertices2d'],
                function ($vertex) use ($image, $offsetX, $offsetY) {
                    return $this->isPixelDrawn($image, $vertex, $offsetX, $offsetY);
                }
            );
            foreach ($face['order'] as $index => $vertexIndex) {
                if (isset($vertices[$vertexIndex])) {
                    continue;
                }

                $vertices[$vertexIndex] = [$face['vertices2d'][$index]->getX(), $face['vertices2d'][$index]->getY()];
                $vertexVisibility[$vertexIndex] = !isset($hiddenVertices[$index]);
            }

            $points = array(
                $face['vertices2d'][0]->getX() + $offsetX, $face['vertices2d'][0]->getY() + $offsetY,
                $face['vertices2d'][1]->getX() + $offsetX, $face['vertices2d'][1]->getY() + $offsetY,
                $face['vertices2d'][2]->getX() + $offsetX, $face['vertices2d'][2]->getY() + $offsetY,
                $face['vertices2d'][3]->getX() + $offsetX, $face['vertices2d'][3]->getY() + $offsetY,
            );
            \imagefilledpolygon($image, $points, 4, $white);
        }

        return array($vertices, $vertexVisibility);
    }

    private function isPixelDrawn($image, $vertex, $offsetX, $offsetY)
    {
        $x = round($vertex->getX() + $offsetX);
        $y = round($vertex->getY() + $offsetY);

        if ($x >= imagesx($image) || $y >= imagesy($image)) {
            return false;
        }

        $imageColor = imagecolorat($image, $x, $y);

        return $imageColor !== 0;
    }
}