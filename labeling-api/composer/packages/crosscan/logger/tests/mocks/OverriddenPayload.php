<?php
class cscntLogOveriddenPayloadMock extends cscntLogPayload 
{
    protected function getSeverity() 
    {
        return self::SEVERITY_DEBUG;
    }

    protected function getFacility() 
    {
        return "overiddenFacility";
    }

    protected function getId() 
    {
        return "overiddenId";
    }

    public function __toString() 
    {
        return "String representation";
    }
}
