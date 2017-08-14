<?php
class cscntInvalidJSONException extends Exception
{
    /**
     * JSON content which could not be decoded properly
     *
     * @var mixed
     */
    public $json = null;


    /**
     * Construct the exception taking the JSON content, which could not be
     * decoded as argument.
     */
    public function __construct( $json )
    {
        $this->json = $json;

        parent::__construct(
            "The provided JSON string is invalid and could not be decoded properly."
        );
    }
}
