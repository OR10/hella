<?php

namespace crosscan\Logger\Message;

use Gelf;

class StringOnly extends Gelf\Message
{
    public function getVersion()
    {
        return $this->asString(parent::getVersion());
    }

    public function getTimestamp()
    {
        return $this->asString(parent::getTimestamp());
    }

    public function getShortMessage()
    {
        return $this->asString(parent::getShortMessage());
    }

    public function setFullMessage($fullMessage)
    {
        return parent::setFullMessage($this->asString($fullMessage));
    }

    public function getFullMessage()
    {
        return $this->asString(parent::getFullMessage());
    }

    public function getFacility()
    {
        return $this->asString(parent::getFacility());
    }

    public function getHost()
    {
        return $this->asString(parent::getHost());
    }

    public function getLevel()
    {
        return $this->asString(parent::getLevel());
    }

    public function getFile()
    {
        return $this->asString(parent::getFile());
    }

    public function getLine()
    {
        return $this->asString(parent::getLine());
    }

    public function getAdditional($key)
    {
        return $this->asString(parent::getAdditional($key));
    }

    /**
     * @param string $key
     * @param mixed $value
     * @return StringOnly
     */
    public function setAdditional($key, $value)
    {
        parent::setAdditional($key, $this->asString($value));
        return $this;
    }

    /**
     * Scalar values are cast to string. if value is an array its content is casted to string recursively and returns
     * string
     * @param $value
     *
     * @return string
     */
    private function asString($value)
    {
        if (is_scalar($value)) {
            return (string) $value;
        }
        if (is_array($value)) {
            return json_encode(array_map(array($this, __FUNCTION__), $value));
        }

        return json_encode($value);
    }
}
