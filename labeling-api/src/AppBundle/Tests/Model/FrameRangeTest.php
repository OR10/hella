<?php

namespace AppBundle\Tests\Model;

use AppBundle\Model\FrameRange;

class FrameRangeTest extends \PHPUnit_Framework_TestCase
{
    public function testConstructorSetsEndFrameToStartFrameIfEndFrameIsOmitted()
    {
        $frameRange = new FrameRange(3);

        $this->assertEquals(3, $frameRange->getStartFrameNumber());
        $this->assertEquals(3, $frameRange->getEndFrameNumber());
        $this->assertEquals(1, $frameRange->getNumberOfFrames());
    }

    /**
     * @expectedException \AppBundle\Model\Exception\InvalidStartFrameNumber
     * @dataProvider getDataForConstructorThrowsInvalidStartFrameNumberForInvalidStartFrames
     */
    public function testConstructorThrowsInvalidStartFrameNumberForInvalidStartFrames($startFrameNumber)
    {
        new FrameRange($startFrameNumber, 1000);
    }

    public function getDataForConstructorThrowsInvalidStartFrameNumberForInvalidStartFrames()
    {
        return [
            ['startFrameNumber' => null],
            ['startFrameNumber' => 0],
            ['startFrameNumber' => -3],
        ];
    }

    /**
     * @expectedException \AppBundle\Model\Exception\InvalidRange
     * @dataProvider getDataForConstructorThrowsInvalidRangeForInvalidRanges
     */
    public function testConstructorThrowsInvalidRangeForInvalidRanges($startFrameNumber, $endFrameNumber)
    {
        new FrameRange($startFrameNumber, $endFrameNumber);
    }

    public function getDataForConstructorThrowsInvalidRangeForInvalidRanges()
    {
        return [
            [
                'startFrameNumber' => 1,
                'endFrameNumber'   => 0,
            ],
            [
                'startFrameNumber' => 1,
                'endFrameNumber'   => -3,
            ],
            [
                'startFrameNumber' => 3,
                'endFrameNumber'   => 2,
            ],
        ];
    }

    /**
     * @dataProvider getDataForCreateSubRangeForOffsetAndLimit
     */
    public function testCreateSubRangeForOffsetAndLimit(
        FrameRange $givenRange,
        $offset,
        $limit,
        FrameRange $expectedFrameRange
    ) {
        $frameRange = $givenRange->createSubRangeForOffsetAndLimit($offset, $limit);

        $this->assertEquals($expectedFrameRange->getStartFrameNumber(), $frameRange->getStartFrameNumber());
        $this->assertEquals($expectedFrameRange->getEndFrameNumber(), $frameRange->getEndFrameNumber());
    }

    public function getDataForCreateSubRangeForOffsetAndLimit()
    {
        return [
            'offset and limit null' => [
                'givenRange' => new FrameRange(1, 10),
                'offset' => null,
                'limit' => null,
                'expectedFrameRange' => new FrameRange(1, 10),
            ],
            'offset and limit specify the whole range' => [
                'givenRange' => new FrameRange(1, 10),
                'offset' => 0,
                'limit' => 10,
                'expectedFrameRange' => new FrameRange(1, 10),
            ],
            'offset given, limit omitted' => [
                'givenRange' => new FrameRange(1, 10),
                'offset' => 3,
                'limit' => null,
                'expectedFrameRange' => new FrameRange(4, 10),
            ],
            'negative offset is set to startFrameNumber - 1 and limit is adjusted' => [
                'givenRange' => new FrameRange(1, 10),
                'offset' => -3,
                'limit' => 30,
                'expectedFrameRange' => new FrameRange(1, 10),
            ],
            'sub-range in the middle' => [
                'givenRange' => new FrameRange(1, 10),
                'offset' => 2,
                'limit' => 6,
                'expectedFrameRange' => new FrameRange(3, 8),
            ],
            'offset beyond endFrameNumber' => [
                'givenRange' => new FrameRange(10, 20),
                'offset' => 30,
                'limit' => 10,
                'expectedFrameRange' => new FrameRange(20, 20),
            ]
        ];
    }
}
