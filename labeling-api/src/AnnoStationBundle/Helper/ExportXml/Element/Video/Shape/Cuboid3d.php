<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Cuboid3d extends ExportXml\Element
{
    /**
     * @var Shapes\Cuboid3d
     */
    private $cuboid3d;

    public function __construct(Shapes\Cuboid3d $cuboid3d)
    {
        $this->cuboid3d = $cuboid3d;
    }

    public function getElement(\DOMDocument $document)
    {
        $cuboid = $document->createElement('cuboid');

        $topLeftFrontPoints = $this->cuboid3d->getFrontTopLeft();
        $topLeftFront       = $document->createElement('top-left-front');
        $topLeftFront->setAttribute('x', $topLeftFrontPoints[0]);
        $topLeftFront->setAttribute('y', $topLeftFrontPoints[1]);
        $topLeftFront->setAttribute('z', $topLeftFrontPoints[2]);
        $cuboid->appendChild($topLeftFront);

        $topRightFrontPoints = $this->cuboid3d->getFrontTopRight();
        $topRightFront       = $document->createElement('top-right-front');
        $topRightFront->setAttribute('x', $topRightFrontPoints[0]);
        $topRightFront->setAttribute('y', $topRightFrontPoints[1]);
        $topRightFront->setAttribute('z', $topRightFrontPoints[2]);
        $cuboid->appendChild($topRightFront);

        $bottomRightFrontPoints = $this->cuboid3d->getFrontBottomRight();
        $bottomRightFront       = $document->createElement('bottom-right-front');
        $bottomRightFront->setAttribute('x', $bottomRightFrontPoints[0]);
        $bottomRightFront->setAttribute('y', $bottomRightFrontPoints[1]);
        $bottomRightFront->setAttribute('z', $bottomRightFrontPoints[2]);
        $cuboid->appendChild($bottomRightFront);

        $bottomLeftFrontPoints = $this->cuboid3d->getFrontBottomLeft();
        $bottomLeftFront       = $document->createElement('bottom-left-front');
        $bottomLeftFront->setAttribute('x', $bottomLeftFrontPoints[0]);
        $bottomLeftFront->setAttribute('y', $bottomLeftFrontPoints[1]);
        $bottomLeftFront->setAttribute('z', $bottomLeftFrontPoints[2]);
        $cuboid->appendChild($bottomLeftFront);

        $topLeftBackPoints = $this->cuboid3d->getBackTopLeft();
        $topLeftBack       = $document->createElement('top-left-back');
        $topLeftBack->setAttribute('x', $topLeftBackPoints[0]);
        $topLeftBack->setAttribute('y', $topLeftBackPoints[1]);
        $topLeftBack->setAttribute('z', $topLeftBackPoints[2]);
        $cuboid->appendChild($topLeftBack);

        $topRightBackPoints = $this->cuboid3d->getBackTopRight();
        $topRightBack       = $document->createElement('top-right-back');
        $topRightBack->setAttribute('x', $topRightBackPoints[0]);
        $topRightBack->setAttribute('y', $topRightBackPoints[1]);
        $topRightBack->setAttribute('z', $topRightBackPoints[2]);
        $cuboid->appendChild($topRightBack);

        $bottomRightBackPoints = $this->cuboid3d->getBackBottomRight();
        $bottomRightBack       = $document->createElement('bottom-right-back');
        $bottomRightBack->setAttribute('x', $bottomRightBackPoints[0]);
        $bottomRightBack->setAttribute('y', $bottomRightBackPoints[1]);
        $bottomRightBack->setAttribute('z', $bottomRightBackPoints[2]);
        $cuboid->appendChild($bottomRightBack);

        $bottomLeftBackPoints = $this->cuboid3d->getBackBottomLeft();
        $bottomLeftBack       = $document->createElement('bottom-left-back');
        $bottomLeftBack->setAttribute('x', $bottomLeftBackPoints[0]);
        $bottomLeftBack->setAttribute('y', $bottomLeftBackPoints[1]);
        $bottomLeftBack->setAttribute('z', $bottomLeftBackPoints[2]);
        $cuboid->appendChild($bottomLeftBack);

        return $cuboid;
    }
}