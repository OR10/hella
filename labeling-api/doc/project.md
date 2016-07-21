# Group Projects

## Get a a single project [/api/project/{projectId}]

+ Parameters
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

### Get a a single project [GET]

+ Response 200 (application/json)
    + Attributes
        + result Project

## Get a list of all projects [/api/project?limit={limit}&offset={offset}]

+ Parameters
    + limit: `10` (integer, optional) - Limit the result.
    + offset: `0` (integer, optional) - Set an offset.
    + projectStatus: `done` (string, optional) - Filter list by status.

### Get all projects [GET]

+ Response 200 (application/json)
    + Attributes
        + totalRows: `5` (number) - Total Number of documents in the database
        + result array(Project)

## Get a list of all finished exports for this project [/api/project/{projectId}/export]

+ Parameters
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

### List all finished exports [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(ProjectExport)

## Download an export [/api/project/{projectId}/export/{projectExportId}]

+ Parameters
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.
    + projectExportId: `583c0838ea5f72671b1b21605c3d6b47` (string, required) - The id of the export.

### Download Export [GET]

+ Response 200

## Start a new export job for this project [/api/project/{projectId}/export/csv]

+ Parameters
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

### Start a new export [POST]

+ Response 200 (application/json)
    + Attributes
        + message: `Export started`