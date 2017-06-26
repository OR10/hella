<?php

namespace AppBundle\DependencyInjection;

use Symfony\Component\DependencyInjection;
use Symfony\Component\DependencyInjection\Compiler;
use Symfony\Component\DependencyInjection\ContainerBuilder;

/**
 * Class ValidatorCompilerPass
 *
 * @package AppBundle\DependencyInjection
 */
class ValidatorCompilerPass implements Compiler\CompilerPassInterface
{

    public static $validatorRegistry = 'annostation.labeling_api.services.validator_registry';

    public static $tagName = 'data.validator';

    public function process(DependencyInjection\ContainerBuilder $container)
    {
        if (!$container->hasDefinition(static::$validatorRegistry)) {
            return;
        }

        $definition     = $container->getDefinition(static::$validatorRegistry);
        $taggedServices = $container->findTaggedServiceIds(static::$tagName);

        foreach ($taggedServices as $serviceId => $tags) {
            $definition->addMethodCall(
                'addValidator',
                [
                    new DependencyInjection\Reference(
                        $serviceId
                    ),
                ]
            );
        }
    }
}
