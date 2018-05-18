<?php

namespace AnnoStationBundle\Helper\Project;

class ProjectFileHelper
{

    /**
     * @param string $stringName
     * @return string
     */
    public function removeSpecialCharacter(string $stringName)
    {
        return preg_replace('/[^a-zA-Z0-9_.]/', '', $stringName);
    }
}
