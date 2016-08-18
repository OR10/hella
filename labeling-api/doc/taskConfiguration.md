# Group Task Configuration

## List all task configurations for the current user [/api/taskConfiguration]

### Own Task Configurations [GET]

+ Parameters

+ Response 200 (application/json)
    + Attributes
        + result
            + array
                + id: `02b531ffe2c35ee965e4b339a61c7ad2` - Id of this task configuration
                + name: `Foobar` - name of this task configuration

## Create new Task Configuration [/api/taskConfiguration]

+ Parameters
    
### Create a new task configuration [POST]

+ Request (application/json)
    + Attributes
        + file: `Attachment` - XML Configuration file
        + name: `foobar` - Some name for this configuration

+ Response 200 (application/json)
    + Attributes (TaskConfiguration)