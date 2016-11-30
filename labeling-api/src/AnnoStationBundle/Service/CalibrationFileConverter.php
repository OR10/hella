<?php

namespace AnnoStationBundle\Service;

class CalibrationFileConverter
{
    /**
     * @var array $data
     */
    private $data;

    /**
     * Set the calibration file and parse the csv file
     *
     * @param $filePath
     */
    public function setCalibrationData($filePath)
    {
        $this->data = $this->parseCsvFile($filePath)[0];
    }

    /**
     * Returns the parsed raw configuration data as array
     *
     * @return array
     */
    public function getRawData()
    {
        return $this->data;
    }

    /**
     * Returns the camera matrix as 4x4 matrix
     *
     * Example Matrix:
     *
     * a b c d
     * e f g h
     * i j k l
     * m n o p
     *
     * array(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
     *
     * @return array
     */
    public function getCameraMatrix()
    {
        return array(
            (float) $this->data['intern_2_fx'],
            (float) $this->data['intern_2_ga'],
            (float) $this->data['intern_2_xc'],
            0,
            0,
            (float) $this->data['intern_2_fy'],
            (float) $this->data['intern_2_yc'],
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
        );
    }

    /**
     *
     * Returns the rotation matrix as 4x4 matrix
     *
     * Example Matrix:
     *
     * a b c d
     * e f g h
     * i j k l
     * m n o p
     *
     * array(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
     *
     * @return array
     */
    public function getRotationMatrix()
    {
        preg_match_all('/-?(\d*\.)\d+/', $this->data['extern_2_ea'], $rotations);

        $yaw   = (float) $rotations[0][0] * (pi() / 180);
        $pitch = (float) $rotations[0][1] * (pi() / 180);
        $roll  = (float) $rotations[0][2] * (pi() / 180);

        return array(
            cos($roll) * $yaw + cos($yaw) * $roll * $pitch,
            $yaw * $roll * $pitch - cos($roll) * cos($yaw),
            -$roll * cos($pitch),
            0,
            cos($yaw) * cos($roll) * $pitch - $roll * $yaw,
            cos($yaw) * $roll + cos($roll) * $pitch * $yaw,
            -(cos($roll)) * cos($pitch),
            0,
            cos($pitch) * cos($yaw),
            cos($pitch) * $yaw,
            $pitch,
            0,
            0,
            0,
            0,
            1,
        );
    }

    /**
     * Returns the translation vectors
     *
     * @return array
     */
    public function getTranslation()
    {
        return array(
            (float) $this->data['extern_2_X'],
            (float) $this->data['extern_2_Y'],
            (float) $this->data['extern_2_Z'],
        );
    }

    /**
     * Returns the distortion coefficients
     *
     * @return array
     */
    public function getDistortionCoefficients()
    {
        preg_match_all('/-?(\d*\.)?\d+/', $this->data['intern_2_kappa'], $kappa);

        return array((float) $kappa[0][0], (float) $kappa[0][1], 0, 0, 0,);
    }

    /**
     * @param $filePath
     *
     * @return array
     */
    private function parseCsvFile($filePath)
    {
        $data = array();
        foreach (preg_split("(\r\n|\r|\n)", file_get_contents($filePath), -1, PREG_SPLIT_NO_EMPTY) as $line) {
            if (empty($line)) {
                continue;
            }
            $data[] = str_getcsv($line, ';', '');
        }

        $data = $this->convertArrayToHashmap($data);

        return $data;
    }

    /**
     * @param array $rows
     *
     * @return mixed
     */
    private function convertArrayToHashmap(array $rows)
    {
        $header = array_shift($rows);

        return array_map(
            function (array $row) use ($header) {
                return array_combine($header, $row);
            },
            $rows
        );
    }
}
