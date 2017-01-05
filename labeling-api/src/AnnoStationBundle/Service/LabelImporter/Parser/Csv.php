<?php

namespace AnnoStationBundle\Service\LabelImporter\Parser;

class Csv extends Base
{
    /**
     * @var string
     */
    private $delimiter = ',';

    /**
     * @var string
     */
    private $enclosure = '"';

    /**
     * @var boolean
     */
    private $firstLineIsHeader = false;

    /**
     * An array of special characters to be removed
     *
     * @var array
     */
    private $removeSpecialCharacters = array();

    /**
     * Iconv encoding input charset
     *
     * @var string
     */
    private $iconvEncodingIn = null;

    /**
     * Iconv encoding output charset
     *
     * @var string
     */
    private $iconvEncodingOut = null;

    /**
     * {@inheritDoc}
     *
     * @return array(string)
     */
    public function parseDataSource()
    {
        $data    = array();
        $content = $this->dataSource->getContents();

        if ($this->iconvEncodingIn !== null && $this->iconvEncodingOut !== null) {
            $content = iconv(
                $this->iconvEncodingIn,
                $this->iconvEncodingOut,
                $content
            );
        }

        foreach ($this->removeSpecialCharacters as $removeSpecialCharacter) {
            $content = str_replace(
                $removeSpecialCharacter,
                '',
                $content
            );
        }

        // this will fail if there is newlines in enclosures
        foreach (
            preg_split(
                "(\r\n|\r|\n)",
                $content,
                -1,
                PREG_SPLIT_NO_EMPTY
            ) as $line
        ) {
            if (empty($line)) {
                continue;
            }
            $data[] = str_getcsv(
                $line,
                $this->delimiter,
                $this->enclosure
            );
        }

        if ($this->firstLineIsHeader) {
            $data = $this->convertArrayToHashmap($data);
        }

        return $data;
    }

    /**
     * @param array $rows
     *
     * @return array
     * @throws \Exception
     */
    private function convertArrayToHashmap(array $rows)
    {
        try {
            // will only throw when warnings are converted to exceptions
            return $this->tryToConvertArrayToHashmap($rows);
        } catch (\Exception $e) {
            throw new \Exception(
                'Could not parse DataSource: ' . $e->getMessage(),
                $e->getCode(),
                $e
            );
        }
    }

    /**
     * @param array $rows
     *
     * @return array
     */
    private function tryToConvertArrayToHashmap(array $rows)
    {
        $header = array_shift($rows);

        return array_map(
            function (array $row) use ($header) {
                return array_combine(
                    $header,
                    $row
                );
            },
            $rows
        );
    }

    /**
     * @param $delimiter
     */
    public function setDelimiter($delimiter)
    {
        $this->delimiter = $delimiter;
    }

    /**
     * @param string $enclosure
     */
    public function setEnclosure($enclosure)
    {
        $this->enclosure = $enclosure;
    }

    /**
     * @param $boolean
     */
    public function setFirstLineIsHeader($boolean)
    {
        $this->firstLineIsHeader = $boolean;
    }

    /**
     * @param array $characters
     */
    public function setRemoveSpecialCharacters(array $characters)
    {
        $this->removeSpecialCharacters = $characters;
    }

    /**
     * Set the iconv encoding charsets for in and out
     *
     * @param string $inCharset
     * @param string $outCharset
     */
    public function setIconvEncodings($inCharset, $outCharset)
    {
        $this->iconvEncodingIn  = $inCharset;
        $this->iconvEncodingOut = $outCharset;
    }
}