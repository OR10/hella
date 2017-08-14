# Group ProjectImporter

## Upload chunk [/api/v1/organisation/{organisationId}/projectImport/{uploadId}]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + uploadId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - Random uploadId identifier.

### Upload chunk [POST]

+ Response 200 (application/json)
    + Attributes
        + result: array() 
        
## Flag upload as complete [/api/v1/organisation/{organisationId}/projectImport/{uploadId}/complete]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + uploadId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - Random uploadId identifier.

### Flag upload as complete [POST]

+ Response 200 (application/json)
    + Attributes
        + taskIds: array() 
        + missing3dVideoCalibrationData: array() 