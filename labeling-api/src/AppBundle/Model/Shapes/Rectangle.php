<?php

namespace AppBundle\Model\Shapes;

use AppBundle\Model;

class Rectangle extends Model\Shape
{
    /**
     * @var string
     */
    private $id;

    private $topLeft = [];

    private $bottomRight = [];

    static public function createFromArray(array $shape)
    {
        if (!isset($shape['id'])
            || !isset($shape['topLeft']['x'])
            || !isset($shape['topLeft']['y'])
            || !isset($shape['bottomRight']['x'])
            || !isset($shape['bottomRight']['y'])
        ) {
            throw new \RuntimeException('Invalid rectangle shape');
        }

        return new Rectangle(
            $shape['id'],
            $shape['topLeft']['x'],
            $shape['topLeft']['y'],
            $shape['bottomRight']['x'],
            $shape['bottomRight']['y']
        );
    }

    /**
     * @param string $id
     * @param float  $left
     * @param float  $top
     * @param float  $right
     * @param float  $bottom
     */
    public function __construct($id, $left, $top, $right, $bottom)
    {
        $this->id          = (string) $id;
        $this->topLeft     = ['x' => (float) $left, 'y' => (float) $top];
        $this->bottomRight = ['x' => (float) $right, 'y' => (float) $bottom];
    }

    public function getId()
    {
        return $this->id;
    }

    public function getType()
    {
        return 'rectangle';
    }

    public function getLeft()
    {
        return $this->topLeft['x'];
    }

    public function getTop()
    {
        return $this->topLeft['y'];
    }

    public function getRight()
    {
        return $this->bottomRight['x'];
    }

    public function getBottom()
    {
        return $this->bottomRight['y'];
    }

    public function getBoundingBox()
    {
        return new BoundingBox(
            $this->topLeft['x'],
            $this->topLeft['y'],
            $this->bottomRight['x'],
            $this->bottomRight['y']
        );
    }

    public function toArray()
    {
        return [
            'id' => $this->getId(),
            'type' => $this->getType(),
            'topLeft' => [
                'x' => $this->topLeft['x'],
                'y' => $this->topLeft['y'],
            ],
            'bottomRight' => [
                'x' => $this->bottomRight['x'],
                'y' => $this->bottomRight['y'],
            ],
        ];
    }
}
