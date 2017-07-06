# Group Task Configuration

## List all task configurations for the current user [/api/organisation/{organisationId}/taskConfiguration]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    
### Own Task Configurations [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + array
                + id: `02b531ffe2c35ee965e4b339a61c7ad2` - Id of this task configuration
                + name: `Foobar` - name of this task configuration

## Create new Task Configuration [/api/organisation/{organisationId}/taskConfiguration]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    
### Create a new task configuration [POST]

+ Request (application/json)
    + Attributes
        + file: `Attachment` - XML Configuration file
        + name: `foobar` - Some name for this configuration

+ Response 200 (application/json)
    + Attributes (TaskConfiguration)
    
## Get a task configuration [/api/organisation/{organisationId}/taskConfiguration/{id}]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
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
                    
## Get a task configuration [/api/organisation/{organisationId}/taskConfiguration/{id}/file]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + id: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the configuration-entity.

### Get a task configuration [GET]

+ Response 200 (application/xml)

## Save a new req. xml [/api/organisation/{organisationId}/taskConfiguration/requirements]

+ Parameters
    + file: `1e8662640b31b28050a9ab5eafa8371e` (binary, required) - XML Requirements File
    + name: `Pedestrians Config` (string, required) - Name of the requirements file.

### Save a new req. XML file [POST]

+ Response 200 (application/xml)
    + Attributes
        + result (TaskConfiguration)