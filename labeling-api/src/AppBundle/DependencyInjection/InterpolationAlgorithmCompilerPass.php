<?php

namespace AppBundle\DependencyInjection;

use Symfony\Component\DependencyInjection;
use Symfony\Component\DependencyInjection\Compiler;

class InterpolationAlgorithmCompilerPass implements Compiler\CompilerPassInterface
{
    public static $interpolationServiceId = 'annostation.labeling_api.service.interpolation';

    public static $tagName = 'annostation.interpolation.algorithm';

    public function process(DependencyInjection\ContainerBuilder $container)
    {
        if (!$container->hasDefinition(static::$interpolationServiceId)) {
            return;
        }

        $definition = $container->getDefinition(static::$interpolationServiceId);

        $taggedServices = $container->findTaggedServiceIds(static::$tagName);

        foreach ($taggedServices as $id => $tags) {
            foreach ($tags as $tag) {
                $definition->addMethodCall('addAlgorithm', [new DependencyInjection\Reference($id)]);
            }
        }
    }
}
