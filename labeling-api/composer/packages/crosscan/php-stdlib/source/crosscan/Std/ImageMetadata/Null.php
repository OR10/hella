<?php

namespace crosscan\Std\ImageMetadata;

/**
 * Implementation of a ImageMetada class, which provides default values for 
 * each of the available properties.
 *
 * This Implementation can be used if a ImageMetadata object is needed, but no 
 * suitable implementation is available to handle the given image format.
 */
class Null extends ImageMetadata
{
    public function getWidth() 
    {
        return 0;
    }

    public function getHeight() 
    {
        return 0;
    }
}
