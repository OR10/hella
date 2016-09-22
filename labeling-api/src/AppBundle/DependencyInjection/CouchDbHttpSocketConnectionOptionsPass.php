<?php

namespace AppBundle\DependencyInjection;

use Doctrine\CouchDB\CouchDBClient;
use Doctrine\CouchDB\HTTP\LoggingClient;
use Doctrine\CouchDB\HTTP\SocketClient;
use Symfony\Component\DependencyInjection;
use Symfony\Component\DependencyInjection\Compiler;

/**
 * Compiler pass to configure the doctrine couchdb connection
 *
 * This should hopefully decrease response times of couchdb access by nearly a factor of 10-15. After a long debugging
 * session we realized there seems to be a problem with continous `fgets` calls on a long lasting connection.
 *
 * On Requests, which transfer a lot of rows this problem still exists, but this fix should at least increase the
 * speed for all of the smaller queries drastically.
 *
 * Until now we have seen response times around 40ms as a minimum for simple couchdb requests. Those requests now take
 * between 1-3ms. (Measured against localhost connections). Eventhough external connection establishing is more costly.
 * This should nevertheless give us a noticable speed bump.
 */
class CouchDbHttpSocketConnectionOptionsPass implements Compiler\CompilerPassInterface
{
    public static $couchdbDefaultConnectionServiceId = 'doctrine_couchdb.client.default_connection';

    public static function configureClient(CouchDBClient $client)
    {
        $httpClient = $client->getHttpClient();

        if ($httpClient instanceof LoggingClient) {
            // @HACK to retrieve "real" client
            $reflector      = new \ReflectionObject($httpClient);
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
        $definition->setConfigurator(
            ['AppBundle\\DependencyInjection\\CouchDbHttpSocketConnectionOptionsPass', 'configureClient']
        );
    }
}
