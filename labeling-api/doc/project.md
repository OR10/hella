# Group Projects

## Get a list of all projects [/api/project]

### Get [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(Project)

## Get a list of all finished exports for this project [/api/project/{projectId}/export]

+ Parameters
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the status.

### Get [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(ProjectExport)

## Download an export [/api/project/{projectId}/export/{projectExportId}]

+ Parameters
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the status.
    + projectExportId: `583c0838ea5f72671b1b21605c3d6b47` (string, required) - The id of the status.

### Get [GET]

+ Response 200

## Start a new export job for this project [/api/project/{projectId}/export/csv]

+ Parameters
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the status.

### Get [GET]

+ Response 200 (application/json)
    + Attributes
        + message: `Export started`
