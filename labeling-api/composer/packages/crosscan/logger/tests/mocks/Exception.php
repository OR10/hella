<?php
// Can't extend from exception here, as all exception getters are final.
class cscntLoggerTestExceptionMock
{
    protected $previous;

    public function __construct( $previous = null )
    {
        $this->previous = $previous;
    }

    public function getMessage()
    {
        return 'Some message';
    }

    public function getPrevious()
    {
        return $this->previous;
    }

    public function getCode()
    {
        return 0;
    }

    public function getFile()
    {
        return "some/file/somewhere.php";
    }

    public function getLine()
    {
        return 42;
    }

    public function getTrace()
    {
        return array(
            array(
                'function' => 'someFunction',
                'class' => 'someClass',
                'type' => '->',
                'args' => array( 'foo', 'bar' )
            ),
            array(
                'file' => '/some/absolute/path.php',
                'line' => 23,
                'function' => 'someOtherFunction',
                'class' => 'someOtherClass',
                'type' => '->',
                'args' => array( 'baz' )
            )
        );
    }

    public function getTraceAsString()
    {
        return 'TRACE';
    }
}
