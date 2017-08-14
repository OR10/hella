<?php

namespace crosscan\Std\Serializer;

use JMS\Serializer\Metadata;
use JMS\Serializer\Naming;

class IdentityNamingStrategy implements Naming\PropertyNamingStrategyInterface
{
    public function translateName(Metadata\PropertyMetadata $property)
    {
        return $property->name;
    }
}
