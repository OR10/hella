<?php

namespace AnnoStationBundle\Controller\Api\Organisation\Project\Exception;

use AppBundle\Exception;
use AnnoStationBundle\Model;

class StorageLimitExceeded extends Exception
{
    /**
     * @param Model\Organisation $organisation
     */
    public function __construct(Model\Organisation $organisation)
    {
        parent::__construct(
            sprintf(
                'Your organisation quota of %s bytes is reached.',
                $organisation->getQuota()
            ),
            507
        );
    }
}
