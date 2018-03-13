<?php

namespace AnnoStationBundle\Service;

class HeaderConverter
{
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
