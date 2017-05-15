# Group Projects

## Get a a single project [/api/organisation/{organisationId}/project/{projectId}]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

### Get a a single project [GET]

+ Response 200 (application/json)
    + Attributes
        + result Project
        
## Delete a Project [/api/organisation/{organisationId}/project/{projectId}]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

### Delete a Project [POST]

+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean) 

## Get a list of all projects [/api/organisation/{organisationId}/project?limit={limit}&offset={offset}]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + limit: `10` (integer, optional) - Limit the result.
    + offset: `0` (integer, optional) - Set an offset.
    + projectStatus: `done` (string, optional) - Filter list by status.

### Get all projects [GET]

+ Response 200 (application/json)
    + Attributes
        + totalRows: `5` (number) - Total Number of documents in the database
        + result array(Project)

## Create a new Project [/api/organisation/{organisationId}/project]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + name: `Some Project` (string) - Project name
    + review: `true` (boolean) - Review process?
    + frameSkip: `22` (number) - Number of frame skips
    + startFrameNumber: `22` (number) - Start frame number
    + splitEach: `0` (number) - Split task every x sec

### Create Project [POST]

+ Response 200 (application/json)
    + Attributes
        + result (Project)

## Get a list of all finished exports for this project [/api/organisation/{organisationId}/project/{projectId}/export]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

### List all finished exports [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(ProjectExport)

## Download an export [/api/organisation/{organisationId}/project/{projectId}/export/{projectExportId}]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.
    + projectExportId: `583c0838ea5f72671b1b21605c3d6b47` (string, required) - The id of the export.

### Download Export [GET]

+ Response 200

## Start a new export job for this project [/api/organisation/{organisationId}/project/{projectId}/export/csv]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

### Start a new export [POST]

+ Response 200 (application/json)
    + Attributes
        + message: `Export started`

## Get sum of projects by status [/api/organisation/{organisationId}/projectCount]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.

### Sum of Projects [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + done: `20` (number) - Number of done jobs
            + `in_progress`: `30` (number) - Number of in_progress jobs
            + todo: `40` (number) - Number of todo jobs

## Set Projects State to in progress [/api/organisation/{organisationId}/project/{projectId}/status/accept]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

### Set State inProgress [POST]

+ Response 200 (application/json)
    + Attributes
        + result true

## Set Projects State to done [/api/organisation/{organisationId}/project/{projectId}/status/done]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

### Set State done [POST]

+ Response 200 (application/json)
    + Attributes
        + result true

## Create a new Report [/api/organisation/{organisationId}/project/{projectId}/report]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

### Create New Report [POST]

+ Response 200 (application/json)
    + Attributes
        + result array(Report)

## Get all Report for Project [/api/organisation/{organisationId}/project/{projectId}/report]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

### Reports by Project [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(Report)

## Get Report by Report ID [/api/organisation/{organisationId}/project/{projectId}/report/{reportId}]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.
    + reportId: `a87f77b135c47576bbde8bca9eac2204` (string, required) - The id of the report.

### Report by id [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(Report)

## Assign project to label coordinator [/api/organisation/{organisationId}/project/{projectId}/assign]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.
    + assignedLabelCoordinatorId: `a87f77b135c47576bbde8bca9eac2204` (string, required) - The id of the coordinator user.

### Assign Project to Coordinator [GET]

+ Response 200 (application/json)
    + Attributes
        + result Project

## Batch upload chunk [POST /api/organisation/{organisationId}/project/batchUpload/{projectId}]

This route provides an api endpoint to upload file chunks for the flow library.
The POST body is not documented here, please have a look at https://github.com/flowjs/flow-php-server.

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

+ Response 200 (application/json)

+ Response 400 (application/json)

+ Response 409 (application/json)

+ Response 500 (application/json)

## Batch upload complete [POST /api/organisation/{organisationId}/project/batchUpload/{projectId}/complete]

This route creates the tasks for all uploaded videos of the given project once all chunks were uploaded completely.

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.

+ Response 200 (application/json)
    + Attributes
        + result
            + taskIds (array)
            
## Get all Task with attention Flagging [/api/organisation/{organisationId}/project/{projectId}/attentionTasks]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + projectId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the project.
    + offset: `10` (number, optional) - Set an offset
    + limit: `5` (number, optional) - Limit the number is tasks

### Get all Task with attention Flagging [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + tasks array(Task)
            + users array(User)
            + totalRows: `5`