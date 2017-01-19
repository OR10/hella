# Group Task Configuration

## List all task configurations for the current user [/api/taskConfiguration]

### Own Task Configurations [GET]

+ Parameters
    + type: `simpleXml` (string, optional) - Limit the result to a type.

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
    
## Get a task configuration [/api/taskConfiguration/{id}]

+ Parameters
    + id: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the configuration-entity.

### Get a task configuration [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + array
                + id: `02b531ffe2c35ee965e4b339a61c7ad2` - Id of this task configuration
                + name: `Foobar` - name of this task configuration
                + filename: `file.xml` - filename
                + userId: `file.xml` - owner user id
                + type: `requirements` - Configuration type requirements/simple
                    
## Get a task configuration [/api/taskConfiguration/{id}/file]

+ Parameters
    + id: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the configuration-entity.

### Get a task configuration [GET]

+ Response 200 (application/xml)