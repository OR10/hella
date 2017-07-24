<?php

namespace FileSystemBundle;

use Doctrine\Bundle\CouchDBBundle\DependencyInjection\Compiler\DoctrineCouchDBMappingsPass;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;
use Symfony\Component\HttpKernel\Bundle\Bundle;

/**
 * Class FileSystemBundle
 *
 * @package FileSystemBundle
 */
class FileSystemBundle extends Bundle
{

    /**
     * @param ContainerBuilder $container
     */
    public function build(ContainerBuilder $container)
    {
        parent::build($container);
        $this->addCouchDbConfig($container);
    }

    /**
     * @param ContainerBuilder $container
     */
    private function addCouchDbConfig(ContainerBuilder $container)
    {
        $container->prependExtensionConfig(
            'doctrine_couch_db',
            [
                'odm' => [
                    'document_managers' => [
                        'default' => [
                            'mappings' => [
                                'FileSystemBundle' => [
                                    'type'      => 'annotation',
                                    'is_bundle' => true,
                                    'mapping'   => true,
                                    'prefix'    => "FileSystemBundle\\Model",
                                    'dir'       => "Model",
                                ],
                            ],
                        ],
                    ],
                ],
            ]
        );
    }
}
