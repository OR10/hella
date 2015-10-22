<?php

namespace AppBundle\Model\Video\ImageType;

class Base
{
    /**
     * Mapping of image type names to type classes
     *
     * @var array $imageTypes
     */
    public static $imageTypes = [
        'source' => Source::class,
    ];

    /**
     * File extension
     *
     * @var string $extension
     */
    protected $extension = '';

    /**
     * Factory method to create the different image types
     *
     * @param $imageType
     *
     * @return mixed
     * @throws \Exception
     */
    public static function create($imageType)
    {
        if (!array_key_exists($imageType, self::$imageTypes)) {
            throw new \Exception('Unsupported Format');
        }

        return new self::$imageTypes[$imageType];
    }

    /**
     * Returns the file types extension
     *
     * @return string
     */
    public function getExtension()
    {
        return $this->extension;
    }

}