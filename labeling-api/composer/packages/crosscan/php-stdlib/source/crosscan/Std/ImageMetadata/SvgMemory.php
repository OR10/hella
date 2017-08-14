<?php

namespace crosscan\Std\ImageMetadata;

class SvgMemory extends ImageMetadata
{
    /**
     * DOM Document representing the stored svg image.
     * 
     * @var \DOMDocument
     */
    protected $dom = null;

    /**
     * DOMXPath object for the currently active svg 
     * 
     * @var \DOMXpath
     */
    protected $xpath = null;

    /**
     * Construct the MetadataImage based on an in memory representation of the 
     * image.
     * 
     * @param string $imageData 
     */
    public function __construct( $imageData ) 
    {
        $this->dom = new \DOMDocument();
        $this->dom->loadXML( $imageData );
        $this->xpath = new \DOMXPath( $this->dom );
        $this->xpath->registerNamespace( 
            "svg",
            "http://www.w3.org/2000/svg"
        );
    }

    /**
     * Return the width of the image 
     * 
     * @return int
     */
    protected function getWidth() 
    {
        $nodes = $this->xpath->query( "/svg:svg/@width" );
        if ( $nodes->length < 1 ) 
        {
            return 0;
        }

        return round( (float)$nodes->item( 0 )->textContent );
    }

    /**
     * Return the height of the image 
     * 
     * @return int
     */
    protected function getHeight() 
    {
        $nodes = $this->xpath->query( "/svg:svg/@height" );
        if ( $nodes->length < 1 ) 
        {
            return 0;
        }

        return round( (float)$nodes->item( 0 )->textContent );
    }
}
