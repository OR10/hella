<?php

namespace AppBundle\Controller\Api;

use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Symfony\Component\HttpFoundation;
use FOS\RestBundle\Controller\Annotations as Rest;
use AppBundle\Controller;

/**
 * @Rest\Prefix("/api/videoUpload")
 * @Rest\Route(service="annostation.labeling_api.controller.api.video_upload")
 */
class VideoUpload extends Controller\Base
{
    /**
     * @Rest\Post
     */
    public function postAction()
    {
        return [];
    }
}
