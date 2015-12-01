<?php

namespace AppBundle\Model;

/**
 * Each concrete implementation reference in `$availableShapes` has to
 * implement a static method `createFromArray`.
 */
abstract class Shape
{
    public static $availableShapes = [
        'rectangle' => Shapes\Rectangle::class,
        'ellipse' => Shapes\Ellipse::class,
        'polygon' => Shapes\Polygon::class,
    ];

    public static function createFromArray(array $shapeAsArray)
    {
        if (!isset($shapeAsArray['type'])) {
            throw new \RuntimeException("Key 'type' is missing");
        }

        if (!isset(static::$availableShapes[$shapeAsArray['type']])) {
            throw new \RuntimeException("Unsupported type '{$shapeAsArray['type']}'");
        }

        $class = static::$availableShapes[$shapeAsArray['type']];

        return $class::createFromArray($shapeAsArray);
    }

    /**
     * Get the id of this shape.
     *
     * @return string
     */
    abstract public function getId();

    /**
     * Get the type of the shape.
     *
     * @return string
     */
    abstract public function getType();

    /**
     * Get the bounding box for this shape.
     *
     * @return Shapes\BoundingBox
     */
    abstract public function getBoundingBox();

    /**
     * @return array
     */
    abstract public function toArray();
}
