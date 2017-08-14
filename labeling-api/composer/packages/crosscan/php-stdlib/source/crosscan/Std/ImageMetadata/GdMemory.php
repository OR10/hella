<?php

namespace crosscan\Std\ImageMetadata;

class GdMemory extends ImageMetadata
{
    /**
     * Gd image referenced from the given string data
     * 
     * @var resource
     */
    protected $image = null;

    /**
     * Construct the MetadataImage based on an in memory representation of the 
     * image.
     * 
     * @param string $imageData 
     */
    public function __construct( $imageData ) 
    {
        $this->image = imagecreatefromstring( $imageData );
    }

    /**
     * Cleanup in case the object is manually destroyed. 
     */
    public function __destruct()
    {
        imagedestroy( $this->image );
    }

    /**
     * Return the width of the image 
     * 
     * @return int
     */
    protected function getWidth() 
    {
        return imagesx( $this->image );
    }

    /**
     * Return the height of the image 
     * 
     * @return int
     */
    protected function getHeight() 
    {
        return imagesy( $this->image );
    }
}
