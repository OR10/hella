<?php

namespace AppBundle\Serializer;

use JMS\Serializer\Naming;
use JMS\Serializer\Metadata;

/**
 * There seems to be a bug or at least not so obvious behaviour regarding the
 * `SerializedName` annotation, so we have to handle this here.
 *
 * @see https://github.com/schmittjoh/serializer/issues/334
 */
class IdenticalUnlessSpecifiedPropertyNamingStrategy implements Naming\PropertyNamingStrategyInterface
{
    public function translateName(Metadata\PropertyMetadata $property)
    {
        if ($property->serializedName !== null) {
            return $property->serializedName;
        }

        return $property->name;
    }
}
