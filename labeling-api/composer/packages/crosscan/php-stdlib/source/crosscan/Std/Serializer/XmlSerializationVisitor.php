<?php

namespace crosscan\Std\Serializer;

class XmlSerializationVisitor extends \JMS\Serializer\XmlSerializationVisitor
{
    public function visitString($data, array $type)
    {
        $needsCDATA = preg_match('/[<>&]/', $data);

        if (null === $this->document) {
            $this->document = $this->createDocument(null, null, true);
            $this->currentNode->appendChild(
                $needsCDATA ? $this->document->createCDATASection($data) : $this->document->createTextNode($data)
            );

            return;
        }

        return $needsCDATA ? $this->document->createCDATASection($data) : $this->document->createTextNode($data);
    }
}
