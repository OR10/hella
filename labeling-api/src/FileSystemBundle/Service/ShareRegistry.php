<?php

namespace FileSystemBundle\Service;

use FileSystemBundle\Model\Share;
use Symfony\Component\Security\Core\Exception\InvalidArgumentException;

/**
 * A registry holding all configured shares.
 *
 * @package FileSystemBundle\Service
 */
class ShareRegistry
{
    /**
     * @var array
     */
    private $shares = array();

    /**
     * ShareRegistry constructor.
     *
     * @param array $shares
     */
    public function __construct(array $shares)
    {
        foreach ($shares as $id => $share) {
            $this->shares[$id] = new Share($id, $share);
        }
    }

    /**
     * Gets a share by ID
     *
     * @param string $shareId
     *
     * @return Share
     */
    public function getShare(string $shareId)
    {
        if (!isset($this->shares[$shareId])) {
            throw new InvalidArgumentException('unknown share id: ' . $shareId);
        }

        return $this->shares[$shareId];
    }
}
