<?php

namespace AppBundle\DependencyInjection;

use Doctrine\CouchDB\CouchDBClient;
use Doctrine\CouchDB\HTTP\LoggingClient;
use Doctrine\CouchDB\HTTP\SocketClient;
use Symfony\Component\DependencyInjection;
use Symfony\Component\DependencyInjection\Compiler;

class CouchDbHttpSocketConnectionOptionsPass implements Compiler\CompilerPassInterface
{
    public static $couchdbDefaultConnectionServiceId = 'doctrine_couchdb.client.default_connection';

    public static function configureClient(CouchDBClient $client) {
        $httpClient = $client->getHttpClient();

        if ($httpClient instanceof LoggingClient) {
            // @HACK to retrieve "real" client
            $reflector = new \ReflectionObject($httpClient);
            $clientProperty = $reflector->getProperty('client');
            $clientProperty->setAccessible(true);
            $httpClient = $clientProperty->getValue($httpClient);
        }

        if ($httpClient instanceof SocketClient) {
            $httpClient->setOption('keep-alive', false);
        }
    }

    public function process(DependencyInjection\ContainerBuilder $container)
    {
        if (!$container->hasDefinition(static::$couchdbDefaultConnectionServiceId)) {
            return;
        }

        $definition = $container->getDefinition(static::$couchdbDefaultConnectionServiceId);
        $definition->setConfigurator(['AppBundle\\DependencyInjection\\CouchDbHttpSocketConnectionOptionsPass', 'configureClient']);
    }
}
