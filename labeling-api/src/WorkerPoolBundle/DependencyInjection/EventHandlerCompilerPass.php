<?php

namespace Hagl\WorkerPoolBundle\DependencyInjection;

use Symfony\Component\DependencyInjection;
use Symfony\Component\DependencyInjection\Compiler;

/**
 * CompilerPass which automatically registers tagged services as WorkerPool EventHandlers.
 */
class EventHandlerCompilerPass implements Compiler\CompilerPassInterface
{
    public static $aggregatorServiceId = 'hagl.workerpool.eventhandler_aggregator';

    public static $tagName = 'hagl.workerpool.eventhandler';

    public function process(DependencyInjection\ContainerBuilder $container)
    {
        if (!$container->hasDefinition(static::$aggregatorServiceId)) {
            return;
        }

        $definition             = $container->getDefinition(static::$aggregatorServiceId);
        $taggedServices         = $container->findTaggedServiceIds(static::$tagName);
        $eventHandlerReferences = [];

        foreach ($taggedServices as $id => $tags) {
            foreach ($tags as $tag) {
                $eventHandlerReferences[] = new DependencyInjection\Reference($id);
            }
        }

        $arguments = $definition->getArguments();

        if (empty($arguments)) {
            $arguments[] = $eventHandlerReferences;
        } else {
            $arguments = array_merge($arguments, $eventHandlerReferences);
        }

        $definition->setArguments($arguments);
    }
}
