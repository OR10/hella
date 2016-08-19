<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use AppBundle\Service;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/dimensionPrediction")
 * @Rest\Route(service="annostation.labeling_api.controller.dimension_prediction")
 *
 * @CloseSession
 */
class DimensionPrediction extends Controller\Base
{
    /**
     * THIS IS JUST A DEFAULT VALUE AND WILL BE REPLACED SOON!
     * Later we will improve this to fetch the next labeledThingInFrame
     *
     * @todo Replace this with something that make more sense
     *
     * @Rest\Get("/{labeledThing}/{frameIndexNumber}")
     *
     * @param Model\LabeledThing $labeledThing
     * @param $frameIndexNumber
     * @param HttpFoundation\Request $request
     * @return \FOS\RestBundle\View\View
     */
    public function getNextLabeledThingInFrameSizesAction(
        Model\LabeledThing $labeledThing,
        $frameIndexNumber,
        HttpFoundation\Request $request
    ) {
        return View\View::create()->setData(
            [
                'result' => [
                    'type' => 'cuboid',
                    'prediction' => [
                        'width' => 1,
                        'height' => 1,
                        'depth' => 1,
                    ]
                ]
            ]
        );
    }
}
