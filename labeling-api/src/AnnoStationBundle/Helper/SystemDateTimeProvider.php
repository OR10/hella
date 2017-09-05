<?php

namespace AnnoStationBundle\Helper;

class SystemDateTimeProvider
{
    public function getDateTime($time = 'now', \DateTimeZone $dateTimeZone)
    {
        return new \DateTime($time, $dateTimeZone);
    }
}