<?php

namespace AnnoStationBundle\Response;

use AppBundle\Model;

class SimpleUsers
{
    /**
     * @var Model\User[]
     */
    private $result = [];

    /**
     * @param $users
     */
    public function __construct(
        $users
    ) {
        /** @var Model\User $user */
        foreach ($users as $user) {
            $this->result[$user->getId()] = [
                'id'       => $user->getId(),
                'username' => $user->getUsername(),
                'email'    => $user->getEmail(),
            ];
        }
    }

    /**
     * @return array
     */
    public function getResult(): array
    {
        return $this->result;
    }
}
