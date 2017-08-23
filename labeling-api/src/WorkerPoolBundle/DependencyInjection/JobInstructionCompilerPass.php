<?php

namespace Hagl\WorkerPoolBundle\DependencyInjection;

use Symfony\Component\DependencyInjection;
use Symfony\Component\DependencyInjection\Compiler;

/**
 * CompilerPass which automatically adds tagged services as JobInstructions.
 */
class JobInstructionCompilerPass implements Compiler\CompilerPassInterface
{
    public static $jobInstructionFactoryServiceId = 'hagl.workerpool.job_instruction_factory';

    public static $tagName = 'hagl.workerpool.job_instruction';

    public function process(DependencyInjection\ContainerBuilder $container)
    {
        if (!$container->hasDefinition(static::$jobInstructionFactoryServiceId)) {
            return;
        }

        $definition = $container->getDefinition(static::$jobInstructionFactoryServiceId);

        $taggedServices = $container->findTaggedServiceIds(static::$tagName);

        foreach ($taggedServices as $id => $tags) {
            foreach ($tags as $tag) {
                $definition->addMethodCall('addJobInstruction', [new DependencyInjection\Reference($id)]);
            }
        }
    }
}
