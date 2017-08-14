<?php
class cscntLogPrefilledOptionsMock extends cscntLogOptions 
{
    public function __construct( array $writers, array $routes )
    {
        parent::__construct();

        foreach( $writers as $id => $writer )
        {
            $this->properties['writers'][$id] = $writer;
        }

        foreach( $routes as $id => $route )
        {
            $this->properties['routes'][$id] = $route;
        }
    }
}
