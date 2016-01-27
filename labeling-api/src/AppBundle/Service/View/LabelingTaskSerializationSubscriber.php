<?php
namespace AppBundle\Service\View;

use JMS\Serializer\EventDispatcher;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use AppBundle\Model;
use AppBundle\Service;

class LabelingTaskSerializationSubscriber implements EventDispatcher\EventSubscriberInterface
{
    /**
     * @var Service\TaskReadOnlyDecider
     */
    private $taskReadOnlyDeciderService;

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @param Storage\TokenStorage $tokenStorage
     * @param Service\TaskReadOnlyDecider $taskReadOnlyDeciderService
     */
    public function __construct(
        Storage\TokenStorage $tokenStorage,
        Service\TaskReadOnlyDecider $taskReadOnlyDeciderService
    ) {
        $this->taskReadOnlyDeciderService = $taskReadOnlyDeciderService;
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * @return array
     */
    public static function getSubscribedEvents()
    {
        return array(
            array(
                'event' => 'serializer.post_serialize',
                'method' => 'onPostSerialize',
                'class' => 'AppBundle\Model\LabelingTask'
            ),
        );
    }

    /**
     * @param EventDispatcher\ObjectEvent $event
     */
    public function onPostSerialize(EventDispatcher\ObjectEvent $event)
    {
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();
        /** @var Model\LabelingTask $labelingTask */
        $labelingTask = $event->getObject();
        $readOnly = $this->taskReadOnlyDeciderService->isTaskReadOnlyForUser($user, $labelingTask);

        $event->getVisitor()->addData('readOnly', $readOnly);
    }

}