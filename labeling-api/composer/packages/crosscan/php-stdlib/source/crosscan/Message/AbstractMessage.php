<?php

namespace crosscan\Message;

abstract class AbstractMessage
{
    /**
     * @var WayPoint[]
     */
    private $waypoints;

    /**
     * @param AbstractMessage $source In case this message is created as a result of a former message
     *        $source may be passed to conserve the way points
     */
    public function __construct(AbstractMessage $source = null)
    {
        if ($source !== null) {
            $this->waypoints = $source->getWayPoints();
        }
    }

    /**
     * Adds a new WayPoint to the list of WayPoints
     *
     * @param WayPoint $wayPoint
     */
    protected function addWayPoint(WayPoint $wayPoint)
    {
        $this->waypoints[] = $wayPoint;
    }

    /**
     * Returns a copy of the list of WayPoints
     *
     * @return WayPoint[]
     */
    protected function getWayPoints()
    {
        return clone $this->waypoints;
    }
}