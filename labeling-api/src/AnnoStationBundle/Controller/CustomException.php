<?php
namespace AnnoStationBundle\Controller;

use Symfony\Bundle\TwigBundle\Controller\ExceptionController;
use Symfony\Bundle\FrameworkBundle\Templating\TemplateReference;
use Symfony\Component\HttpKernel\Exception\FlattenException;
use Symfony\Component\HttpKernel\Log\DebugLoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Monolog\Logger;

class CustomException extends ExceptionController
{
    protected $logger;

    public function __construct(\Twig_Environment $twig, $debug, Logger $logger)
    {
        parent::__construct($twig, $debug);

        $this->logger = $logger;
    }

    /**
     * Converts an Exception to a Response
     *
     * @param Request              $request The request
     * @param FlattenException     $exception A FlattenException instance
     * @param DebugLoggerInterface $logger A DebugLoggerInterface instance
     *
     * @return Response
     *
     * @throws \InvalidArgumentException When the exception template does not exist
     */
    public function showAction(Request $request, FlattenException $exception, DebugLoggerInterface $logger = null)
    {
        $currentContent = $this->getAndCleanOutputBuffering($request->headers->get('X-Php-Ob-Level', -1));
        $showException  = $request->attributes->get(
            'showException',
            $this->debug
        ); // As opposed to an additional parameter, this maintains BC

        $code          = $exception->getStatusCode();
        $exceptionName = join('', array_slice(explode('\\', $exception->getClass()), -1));

        $this->logError($request, $exception, $logger);

        return new Response(
            $this->twig->render(
                (string) $this->findTemplate($request, 'json', $code, $showException),
                array(
                    'type'           => $exceptionName,
                    'status_code'    => $code,
                    'status_text'    => $exception->getMessage(),
                    'exception'      => $exception,
                    'logger'         => $logger,
                    'currentContent' => $currentContent,
                )
            )
        );
    }

    private function logError(Request $request, FlattenException $exception, DebugLoggerInterface $logger = null)
    {
        $currentContent = $this->getAndCleanOutputBuffering($request->headers->get('X-Php-Ob-Level', -1));
        $showException  = $request->attributes->get('showException', true);

        $code = $exception->getStatusCode();
        $exceptionName = join('', array_slice(explode('\\', $exception->getClass()), -1));

        $data = $this->twig->render((string) $this->findTemplate($request, 'json', $code, $showException), [
            'type'           => $exceptionName,
            'status_code'    => $code,
            'status_text'    => $exception->getMessage(),
            'exception'      => $exception,
            'logger'         => $logger,
            'currentContent' => $currentContent,
        ]);

        $this->logger->log(Logger::CRITICAL, $data);
    }
}
