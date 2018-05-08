<?php

namespace AppBundle\Controller;

use AnnoStationBundle\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class VersionController extends Controller\Base
{
    public function versionAction()
    {
        return new JsonResponse([
            'docker_be_tag' => getenv('DOCKER_BE_TAG'),
            'docker_fe_tag' => getenv('DOCKER_FE_TAG'),
        ]);
    }
}
