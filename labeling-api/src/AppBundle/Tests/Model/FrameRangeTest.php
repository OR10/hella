<?php

namespace AppBundle\Tests\Model;

use AppBundle\Model\FrameRange;

class FrameRangeTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @dataProvider getDataProvider
     */
    public function testCreateSubRangeForOffsetAndLimit(
        FrameRange $givenRange,
        $offset,
        $limit,
        FrameRange $expectedFrameRange
    )
    {
        $frameRange = $givenRange->createSubRangeForOffsetAndLimit($offset, $limit);

        $this->assertEquals($expectedFrameRange->getStartFrameNumber(), $frameRange->getStartFrameNumber());
        $this->assertEquals($expectedFrameRange->getEndFrameNumber(), $frameRange->getEndFrameNumber());
    }

    public function getDataProvider()
    {
        return [
            [
                'givenRange' => new FrameRange(1, 10),
                'offset' => null,
                'limit' => null,
                'expectedFrameRange' => new FrameRange(1, 10),
            ],
            [
                'givenRange' => new FrameRange(1, 10),
                'offset' => 0,
                'limit' => 10,
                'expectedFrameRange' => new FrameRange(1, 10),
            ],
            [
                'givenRange' => new FrameRange(1, 10),
                'offset' => 3,
                'limit' => null,
                'expectedFrameRange' => new FrameRange(4, 10),
            ],
            [
                'givenRange' => new FrameRange(1, 10),
                'offset' => -3,
                'limit' => 30,
                'expectedFrameRange' => new FrameRange(1, 10),
            ],
            [
                'givenRange' => new FrameRange(1, 10),
                'offset' => 2,
                'limit' => 6,
                'expectedFrameRange' => new FrameRange(3, 8),
            ],
        ];
    }
}
