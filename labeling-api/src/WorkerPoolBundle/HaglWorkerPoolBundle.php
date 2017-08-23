<?php

namespace Hagl\WorkerPoolBundle;

use Hagl\WorkerPoolBundle\DependencyInjection;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class HaglWorkerPoolBundle extends Bundle
{
    public function build(ContainerBuilder $container)
    {
        parent::build($container);

        $container->addCompilerPass(new DependencyInjection\EventHandlerCompilerPass());
        $container->addCompilerPass(new DependencyInjection\JobInstructionCompilerPass());
    }
}
