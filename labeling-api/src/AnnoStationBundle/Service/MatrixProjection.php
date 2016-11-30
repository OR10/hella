<?php

namespace AnnoStationBundle\Service;

use AppBundle\Helper\Matrix;

class MatrixProjection
{
    /**
     * @param Matrix\Vector4 $vectorIn
     * @param $calibrationData
     * @return Matrix\Vector3
     */
    public function project3dTo2d(Matrix\Vector4 $vectorIn, $calibrationData)
    {
        return $this->applyCameraMatrix(
            $this->applyDistortion(
                $this->projectIntoCameraPlane(
                    $this->transformIntoCameraSpace($vectorIn, $calibrationData)
                ),
                $calibrationData
            ),
            $calibrationData
        );
    }

    /**
     * @param Matrix\Vector4 $vector
     * @param $calibrationData
     * @return Matrix\Vector4
     */
    private function transformIntoCameraSpace(Matrix\Vector4 $vector, $calibrationData)
    {
        $translationData = $calibrationData['translation'];
        $rotationData = $calibrationData['rotationMatrix'];

        $rotationMatrix = new Matrix\Matrix4();
        $rotationMatrix->set($rotationData);

        $translationMatrix = new Matrix\Matrix4();
        $translationMatrix->makeTranslation(
            -((float)$translationData[0]),
            -((float)$translationData[1]),
            -((float)$translationData[2])
        );

        $viewMatrix = new Matrix\Matrix4();
        $viewMatrix->multiply($rotationMatrix);
        $viewMatrix->multiply($translationMatrix);

        return $vector->applyMatrix4($viewMatrix);
    }

    /**
     * @param Matrix\Vector4 $vector
     * @return Matrix\Vector3
     */
    private function projectIntoCameraPlane(Matrix\Vector4 $vector)
    {
        return new Matrix\Vector3(
            $vector->getX() / $vector->getZ(),
            $vector->getY() / $vector->getZ(),
            1
        );
    }

    /**
     * @param Matrix\Vector3 $vector
     * @param $calibrationData
     * @return Matrix\Vector3
     */
    private function applyDistortion(Matrix\Vector3 $vector, $calibrationData)
    {
        $k1 = $calibrationData['distortionCoefficients'][0];
        $k2 = $calibrationData['distortionCoefficients'][1];

        $r2 = pow($vector->getX(), 2) + pow($vector->getY(), 2);
        $r4 = pow($r2, 2);

        return new Matrix\Vector3(
            $vector->getX() + $vector->getX() * ($k1 * $r2 + $k2 * $r4),
            $vector->getY() + $vector->getY() * ($k1 * $r2 + $k2 * $r4),
            1
        );
    }

    private function applyCameraMatrix(Matrix\Vector3 $vector, $calibrationData)
    {
        $cameraMatrix = new Matrix\Matrix4();
        $cameraMatrix->set($calibrationData['cameraMatrix']);
        return $vector->applyMatrix4($cameraMatrix);
    }
}
