<?php

namespace Hagl\WorkerPoolBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

class Configuration implements ConfigurationInterface
{
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode    = $treeBuilder->root('hagl_worker_pool');

        $rootNode
            ->children()
                ->scalarNode('queue_prefix')
                    ->defaultValue('')
                    ->treatNullLike('')
                ->end()
                ->scalarNode('logger')
                    ->isRequired()
                ->end()
                ->scalarNode('config')
                    ->isRequired()
                ->end()
                ->scalarNode('facade')
                    ->isRequired()
                ->end()
            ->end();

        return $treeBuilder;
    }
}
