<?php

namespace AppBundle\Tests\Model;

use AppBundle\Model\FrameRange;

class FrameRangeTest extends \PHPUnit_Framework_TestCase
{
    public function testConstructorSetsEndFrameToStartFrameIfEndFrameIsOmitted()
    {
        $frameRange = new FrameRange(3);

        $this->assertEquals(3, $frameRange->getStartFrameIndex());
        $this->assertEquals(3, $frameRange->getEndFrameIndex());
        $this->assertEquals(1, $frameRange->getNumberOfFrames());
    }

    /**
     * @expectedException \AppBundle\Model\Exception\InvalidStartFrameIndex
     * @dataProvider getDataForConstructorThrowsInvalidStartFrameIndexForInvalidStartFrames
     */
    public function testConstructorThrowsInvalidstartFrameIndexForInvalidStartFrames($startFrameIndex)
    {
        new FrameRange($startFrameIndex, 1000);
    }

    public function getDataForConstructorThrowsInvalidStartFrameIndexForInvalidStartFrames()
    {
        return [
            ['startFrameIndex' => null],
            ['startFrameIndex' => 0],
            ['startFrameIndex' => -3],
        ];
    }

    /**
     * @expectedException \AppBundle\Model\Exception\InvalidRange
     * @dataProvider getDataForConstructorThrowsInvalidRangeForInvalidRanges
     */
    public function testConstructorThrowsInvalidRangeForInvalidRanges($startFrameIndex, $endFrameIndex)
    {
        new FrameRange($startFrameIndex, $endFrameIndex);
    }

    public function getDataForConstructorThrowsInvalidRangeForInvalidRanges()
    {
        return [
            [
                'startFrameIndex' => 1,
                'endFrameIndex'   => 0,
            ],
            [
                'startFrameIndex' => 1,
                'endFrameIndex'   => -3,
            ],
            [
                'startFrameIndex' => 3,
                'endFrameIndex'   => 2,
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

        $this->assertEquals($expectedFrameRange->getStartFrameIndex(), $frameRange->getStartFrameIndex());
        $this->assertEquals($expectedFrameRange->getEndFrameIndex(), $frameRange->getEndFrameIndex());
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
            'negative offset is set to startFrameIndex - 1 and limit is adjusted' => [
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
            'offset beyond endFrameIndex' => [
                'givenRange' => new FrameRange(10, 20),
                'offset' => 30,
                'limit' => 10,
                'expectedFrameRange' => new FrameRange(20, 20),
            ],
            'sub-range bug with offset and limit greater than number of frames' => [
                'givenRange' => new FrameRange(1, 10),
                'offset' => 11,
                'limit' => 11,
                'expectedFrameRange' => new FrameRange(10, 10),
            ],
        ];
    }
}
