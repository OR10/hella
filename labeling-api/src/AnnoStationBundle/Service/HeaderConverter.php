<?php

namespace AnnoStationBundle\Service;

/**
 * Class HeaderConverter
 * @package AnnoStationBundle\Service
 * convert headers variable
 */
class HeaderConverter
{

    /**
     * @param $header
     * @return mixed|null
     */
    public function getBasic($header)
    {
        $token = null;
        if (preg_match('/Basic\s(\S+)/', $header, $matches)) {
            if(is_array($matches)) {
                $token = $matches[1];
            }
        }
        return $token;
    }
}
