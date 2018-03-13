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
     * @param string $header
     * @return mixed|null
     * return Basic $token
     */
    public function getBasic(string $header)
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
