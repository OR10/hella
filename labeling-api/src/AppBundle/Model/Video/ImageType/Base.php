<?php

namespace AppBundle\Model\Video\ImageType;

class Base
{
    /**
     * Mapping of image type names to classes
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

    public static function create($imageType)
    {
        if (!array_key_exists($imageType, self::$imageTypes)) {
            throw new \Exception('Unsupported Format');
        }

        return new self::$imageTypes[$imageType];
    }

    public function getExtension()
    {
        return $this->extension;
    }

}