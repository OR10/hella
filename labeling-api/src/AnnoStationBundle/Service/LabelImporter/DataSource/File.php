<?php

namespace AnnoStationBundle\Service\LabelImporter\DataSource;

use AnnoStationBundle\Service\LabelImporter;
use AnnoStationBundle\Service\LabelImporter\DataSource\Exception;

class File implements LabelImporter\DataSource
{
    /**
     * @var \SplFileObject
     */
    protected $fileObject;

    /**
     * @param \SplFileObject $fileObject
     */
    public function __construct(\SplFileObject $fileObject)
    {
        $this->fileObject = $fileObject;
    }

    /**
     * {@inheritDoc}
     *
     * @throws Exception\InaccessibleDataSourceException When File is not Readable
     * @return string
     */
    public function getContents()
    {
        try {
            return $this->getContentsFromFileObject();
        } catch (\Exception $e) {
            throw new Exception\InaccessibleDataSourceException(
                sprintf(
                    'Cannot get contents of file "%s": %s',
                    $this->fileObject->getPathname(),
                    $e->getMessage()
                ),
                $e->getCode(),
                $e
            );
        }
    }

    /**
     * @return string
     */
    private function getContentsFromFileObject()
    {
        $content = file_get_contents($this->fileObject->getRealPath());

        // Remove UTF-8 BOM if present
        $content = ltrim(
            $content,
            "\xEF\xBB\xBF"
        );

        return $content;
    }
}