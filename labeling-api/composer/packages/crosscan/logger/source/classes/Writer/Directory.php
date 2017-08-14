<?php
use crosscan\Std;

/**
 * Directory based LogWriter
 *
 * This Writer puts all Payloads which belong into one cycle into one
 * timestamped directory. Furthermore the different content types are recreated
 * as useful file representation (aka. images are written in their raw format,
 * named with a usable extension).
 */
class cscntLogDirectoryWriter extends cscntLogWriter implements cscntLogFileConsumer, cscntLogHierarchicalArrayStructConsumer
{
    /**
     * Directory to be used as output target
     *
     * @var string
     */
    protected $directory = null;

    /**
     * Subdirectory used to store the payloads of the current cycle.
     *
     * Recreated on each <tt>begin()</tt> call.
     *
     * @var string
     */
    protected $currentDirectory = null;

    /**
     * Unique identifier of the current group
     *
     * @var string
     */
    protected $group;

    /**
     * Create a new directory writer taking the target directory to be filled
     * with new directories (one for each log entry) as argument.
     *
     * If the directory exists it will be reused (No existing data will be
     * touched). If it does not exist it will be created.
     *
     * @throws ezcBaseFilePermissionException if the directory could not be
     * created or there is no write access to store information in it.
     *
     * @param string $directory
     */
    public function __construct( $directory )
    {
        if ( ( file_exists( $directory ) === true && is_dir( $directory ) !== true )
          || ( is_dir( $directory ) === true && is_writable( $directory ) === false )
          || ( is_link( $directory ) === true && file_exists( $directory ) !== true ) )

        {
            throw new cscntPropertyPermissionException(
                $directory,
                cscntPropertyPermissionException::WRITE
            );
        }

        if ( is_dir( $directory ) !== true )
        {
            mkdir( $directory );
        }

        $this->directory = $directory;
    }

    /**
     * Set a new group to log every new log message into.
     *
     * @param string $uuid
     * @return void
     */
    public function setGroup( $uuid )
    {
        $this->group = $uuid;
        $this->createNewLogDirectory();
    }

    /**
     * Create a new directory to hold all the payloads from this cycle
     *
     * @return void
     */
    protected function createNewLogDirectory()
    {
        $now = new DateTime();

        $textualNow = $now->format( "M-d-H.i.s" );
        $i = 1;
        $toCheck = $textualNow . '-' . (string)$this->group;

        // Actually it would be more intelligent to use an mkdir inside the
        // while loop directly, to check and create the directory in an atomic
        // operation. But the triggered warning, as well as the stupid phpunit
        // error handling does not allow that.
        while( file_exists( $this->directory . '/' . $toCheck ) === true )
        {
            $toCheck = $this->directory . '-' . $i++;
        }

        mkdir( $this->directory . '/' . $toCheck );
        $this->currentDirectory = $this->directory . '/' . $toCheck;
    }

    /**
     * Log a string based payload
     *
     * @param int $severity
     * @param string $facility
     * @param string|null $id
     * @param string $message
     * @return void
     */
    public function fromString( $severity, $facility, $id, $message )
    {
        // A FileWriter is reused to store all logged message strings
        $writer = new cscntLogFileWriter(
            $this->currentDirectory . '/messages.log'
        );

        $writer->fromString( $severity, $facility, $id, $message );

        unset( $writer );
    }

    /**
     * Consume a given StdClass as hierarchical array structure.
     *
     * @param mixed $severity
     * @param mixed $facility
     * @param mixed $id
     * @param array $data
     * @return void
     */
    public function fromHierarchicalArrayStruct($severity, $facility, $id, array $data)
    {
        if ( $id === null )
        {
            $id = "document";
        }

        // @TODO: Pretty print the json output.
        file_put_contents(
            $this->ensureNewFile( $id . '.json' ),
            json_encode( $data )
        );
    }

    /**
     * Write the file binary data based payload
     *
     * @param mixed $severity
     * @param mixed $facility
     * @param mixed $id
     * @param cscntLogFileStruct $file
     * @return void
     */
    public function fromFile($severity, $facility, $id, cscntLogFileStruct $file)
    {
        if ( $id === null )
        {
            $id = "file";
        }

        file_put_contents(
            $this->ensureNewFile( $id . ".raw" ),
            $file->fileData
        );
    }

    /**
     * Ensure the given filename does not already exist.
     *
     * If it does append a dot and a number starting at 1.
     *
     * A usable unique name will be returned. The file will be created by this
     * method to overcome race conditions.
     *
     * @param string $filename
     * @return string
     */
    protected function ensureNewFile( $filename )
    {
        $pathinfo = pathinfo( $filename );

        $toCheck = $this->currentDirectory . '/' . $filename;
        $i = 1;


        while( file_exists( $toCheck ) === true || touch( $toCheck ) === false )
        {
            $toCheck = $this->currentDirectory . '/' . $pathinfo['filename'] . '.' . $i++ . '.' . $pathinfo['extension'];
        }

        return $toCheck;
    }
}
