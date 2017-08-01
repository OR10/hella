<?php

namespace AnnoStationBundle\Tests\Helper;

use AnnoStationBundle\Model;
use AppBundle\Model as AppBundleModel;

/**
 * Helper class to create LabelingTimer.
 */
class AdditionalFrameNumberMappingBuilder
{
    /**
     * @var Model\Organisation
     */
    private $organisation;

    /**
     * @var string
     */
    private $attachmentFilePath;

    /**
     * @var array
     */
    private $frameNumberMapping = [];

    public function __construct(Model\Organisation $organisation)
    {
        $this->organisation = $organisation;
    }

    /**
     * @param Model\Organisation $organisation
     *
     * @return AdditionalFrameNumberMappingBuilder
     */
    public static function create(Model\Organisation $organisation)
    {
        return new self($organisation);
    }

    /**
     * @param string $filePath
     *
     * @return $this
     */
    public function withAttachment(string $filePath)
    {
        $this->attachmentFilePath = $filePath;

        return $this;
    }

    /**
     * @param $frameNumberMapping
     *
     * @return $this
     */
    public function withFrameNumberMapping($frameNumberMapping)
    {
        $this->frameNumberMapping = $frameNumberMapping;

        return $this;
    }

    /**
     * @return Model\AdditionalFrameNumberMapping
     */
    public function build()
    {
        $additionalFrameNumberMapping = new Model\AdditionalFrameNumberMapping(
            $this->organisation
        );

        if ($this->attachmentFilePath !== null) {
            $additionalFrameNumberMapping->addAttachment(
                basename($this->attachmentFilePath),
                file_get_contents($this->attachmentFilePath),
                mime_content_type($this->attachmentFilePath)
            );
        }

        $additionalFrameNumberMapping->setFrameNumberMapping($this->frameNumberMapping);

        return $additionalFrameNumberMapping;
    }
}
