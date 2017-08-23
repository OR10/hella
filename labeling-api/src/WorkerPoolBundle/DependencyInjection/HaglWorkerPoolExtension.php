<?php

namespace Hagl\WorkerPoolBundle\DependencyInjection;

use crosscan\WorkerPool\EventHandler\Aggregator;
use crosscan\WorkerPool\JobRescheduler;
use Hagl\WorkerPoolBundle\Command\Maintainer;
use Hagl\WorkerPoolBundle\Command\Rescheduler;
use Hagl\WorkerPoolBundle\Command\Setup;
use Hagl\WorkerPoolBundle\Command\Starter;
use Hagl\WorkerPoolBundle\JobInstructionFactory;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class HaglWorkerPoolExtension extends Extension
{
    public function load(array $configs, ContainerBuilder $container)
    {
        $config = $this->processConfiguration(new Configuration(), $configs);

        $this->addJobReschedulerDefinition($container, $config);
        $this->addEventHandlerAggregatorDefinition($container);
        $this->addJobInstructionFactoryDefinition($container);
        $this->addConsoleCommandDefinitions($container, $config);
    }

    /**
     * @param ContainerBuilder $container
     * @param array            $config
     */
    private function addJobReschedulerDefinition(ContainerBuilder $container, array $config)
    {
        $jobReschedulerDefinition = new Definition(
            JobRescheduler::class,
            [
                new Reference($config['facade']),
                new Reference($config['config']),
            ]
        );

        $container->setDefinition($this->createServiceId('job_rescheduler'), $jobReschedulerDefinition);
    }

    /**
     * @param ContainerBuilder $container
     */
    private function addEventHandlerAggregatorDefinition(ContainerBuilder $container)
    {
        $eventHandlerAggregatorDefinition = new Definition(Aggregator::class);
        $container->setDefinition($this->createServiceId('eventhandler_aggregator'), $eventHandlerAggregatorDefinition);
    }

    /**
     * @param ContainerBuilder $container
     */
    private function addJobInstructionFactoryDefinition(ContainerBuilder $container)
    {
        $jobInstructionFactoryDefinition = new Definition(JobInstructionFactory::class);
        $container->setDefinition($this->createServiceId('job_instruction_factory'), $jobInstructionFactoryDefinition);
    }

    /**
     * @param ContainerBuilder $container
     * @param array            $config
     */
    private function addConsoleCommandDefinitions(ContainerBuilder $container, array $config)
    {
        $setupCommandDefinition = new Definition(
            Setup::class,
            [
                new Reference($config['config']),
                $config['queue_prefix'],
            ]
        );
        $setupCommandDefinition->addTag('console.command');

        $starterCommandDefinition = new Definition(
            Starter::class,
            [
                new Reference($config['config']),
                new Reference($config['logger']),
                new Reference($this->createServiceId('job_instruction_factory')),
                new Reference($this->createServiceId('eventhandler_aggregator')),
                $config['queue_prefix'],
            ]
        );
        $starterCommandDefinition->addTag('console.command');

        $maintainerCommandDefinition = new Definition(
            Maintainer::class,
            [
                new Reference($config['config']),
                new Reference($config['facade']),
                $config['queue_prefix'],
            ]
        );
        $maintainerCommandDefinition->addTag('console.command');

        $reschedulerCommandDefinition = new Definition(
            Rescheduler::class,
            [
                new Reference($this->createServiceId('job_rescheduler')),
            ]
        );
        $reschedulerCommandDefinition->addTag('console.command');

        $container->setDefinition($this->createServiceId('setup_command'), $setupCommandDefinition);
        $container->setDefinition($this->createServiceId('starter_command'), $starterCommandDefinition);
        $container->setDefinition($this->createServiceId('maintainer_command'), $maintainerCommandDefinition);
        $container->setDefinition($this->createServiceId('rescheduler_command'), $reschedulerCommandDefinition);
    }

    /**
     * @param string $id
     *
     * @return string
     */
    private function createServiceId(string $id)
    {
        return sprintf('hagl.workerpool.%s', $id);
    }
}
