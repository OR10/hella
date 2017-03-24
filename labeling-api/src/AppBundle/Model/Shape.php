<?php

namespace AppBundle\Model;

/**
 * Each concrete implementation has to be referenced in `$availableShapes` in
 * order to be able to create a shape of this type using
 * `Shape::createFromArray`. In addition to this, the implementation has to
 * provide a static method `createFromArray` which takes an array and returns
 * an instance of the concrete shape.
 */
abstract class Shape
{
    public static $availableShapes = [
        'rectangle' => Shapes\Rectangle::class,
        'ellipse' => Shapes\Ellipse::class,
        'polygon' => Shapes\Polygon::class,
        'polyline' => Shapes\Polyline::class,
        'pedestrian' => Shapes\Pedestrian::class,
        'cuboid3d' => Shapes\Cuboid3d::class,
    ];

    public static function createFromArray(array $shapeAsArray)
    {
        if (!isset($shapeAsArray['type'])) {
            throw new \RuntimeException("Key 'type' is missing");
        }

        if (!isset(static::$availableShapes[$shapeAsArray['type']])) {
            throw new \RuntimeException("Unsupported type '{$shapeAsArray['type']}'");
        }

        return call_user_func(
            [static::$availableShapes[$shapeAsArray['type']], 'createFromArray'],
            $shapeAsArray
        );
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
