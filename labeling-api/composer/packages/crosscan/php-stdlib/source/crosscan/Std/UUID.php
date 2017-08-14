<?php

namespace crosscan\Std;

use crosscan\Exception;

/**
 * Generator for UUIDs in version v4
 */
class UUID
{
    /**
     * Initially generated UUID, which is represented by this object
     *
     * @var string
     */
    protected $uuid;

    /**
     * Namespace UUID used for generating v5 UUIDs.
     *
     * @var string|null
     */
    protected $namespace = null;

    /**
     * Optionally a namespace, which must be a valid UUID, can be given to this class in order to use it for
     * generating UUIDs v5.
     *
     * NOTE: If a namespace is set NO UUIDv4 will be generated and the toString method will simply generate a UUIDv5
     * with a value of null. Therefore in most cases you will have to call generateUUIDv5() with a proper value yourself
     *
     * @param string|null $namespace
     */
    public function __construct($namespace = null)
    {
        if ($namespace !== null) {
            if (!$this->isValid($namespace)) {
                throw new Exception\NoValidUUID($namespace);
            }
            $this->namespace = $namespace;
        } else {
            $this->uuid = $this->generateUUID();
        }
    }

    /**
     * Return the stored UUIDv4 in textual hexadecimal form
     *
     * @return string
     */
    public function __toString()
    {
        if ($this->namespace !== null) {
            return $this->generateUUIDv5(null);
        }
        return $this->uuid;
    }

    public function toDashlessString()
    {
        return str_replace('-', '', (string) $this);
    }

    /**
     * Generate and return a valid UUIDv4
     *
     * Implementation taken from:
     * http://www.php.net/manual/en/function.uniqid.php#94959
     *
     * @return string
     */
    protected function generateUUID()
    {
        return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            // 32 bits for "time_low"
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),

            // 16 bits for "time_mid"
            mt_rand( 0, 0xffff ),

            // 16 bits for "time_hi_and_version",
            // four most significant bits holds version number 4
            mt_rand( 0, 0x0fff ) | 0x4000,

            // 16 bits, 8 bits for "clk_seq_hi_res",
            // 8 bits for "clk_seq_low",
            // two most significant bits holds zero and one for variant DCE1.1
            mt_rand( 0, 0x3fff ) | 0x8000,

            // 48 bits for "node"
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
        );
    }

    /**
     * Generate and return a valid UUIDv5
     *
     * Implementation taken from:
     * http://www.php.net/manual/en/function.uniqid.php#94959
     *
     * @param string $name
     * @return string
     */
    public function generateUUIDv5($name)
    {
        // Get hexadecimal components of namespace
        $nhex = str_replace(array('-', '{', '}'), '', $this->namespace);

        // Binary Value
        $nstr = '';

        // Convert Namespace UUID to bits
        for ($i = 0; $i < strlen($nhex); $i += 2) {
            $nstr .= chr(hexdec($nhex[$i] . $nhex[$i + 1]));
        }

        // Calculate hash value
        $hash = sha1($nstr . $name);

        return sprintf(
            '%08s-%04s-%04x-%04x-%12s',

            // 32 bits for "time_low"
            substr($hash, 0, 8),

            // 16 bits for "time_mid"
            substr($hash, 8, 4),

            // 16 bits for "time_hi_and_version",
            // four most significant bits holds version number 5
            (hexdec(substr($hash, 12, 4)) & 0x0fff) | 0x5000,

            // 16 bits, 8 bits for "clk_seq_hi_res",
            // 8 bits for "clk_seq_low",
            // two most significant bits holds zero and one for variant DCE1.1
            (hexdec(substr($hash, 16, 4)) & 0x3fff) | 0x8000,

            // 48 bits for "node"
            substr($hash, 20, 12)
        );
    }

    /**
     * Checks if the given UUID is a valid one
     *
     * Implementation taken from:
     * http://www.php.net/manual/en/function.uniqid.php#94959
     *
     * @param string $uuid
     * @return bool
     */
    public function isValid($uuid) {
        return preg_match(
            '/^\{?[0-9a-f]{8}\-?[0-9a-f]{4}\-?[0-9a-f]{4}\-?[0-9a-f]{4}\-?[0-9a-f]{12}\}?$/i',
            $uuid
        ) === 1;
    }
}
