# Group Task

## List all tasks [/api/v1/task{?offset,limit,taskStatus,project}]

### Get a list of all tasks [GET]

+ Parameters
    + project: `02b531ffe2c35ee965e4b339a61c7ad2` (string) - Task list for project id
    + offset: `10` (number, optional) - Set an offset
    + limit: `5` (number, optional) - Limit the number is tasks
    + taskStatus: `labeled` (string, optional) - Fetch only tasks with a given status

+ Response 200 (application/json)
    + Attributes
        + result
            + array (Task)

## Get a specific task [/api/v1/task/{id}]

+ Parameters
    + id: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Get task [GET]

+ Response 200 (application/json)
    + Attributes
        + result (Task)

## Get frame locations of a task [/api/v1/task/{taskId}/frameLocations/{type}{?offset,limit}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f002ee6` (string, required) - The id of the task-entity.
    + type: `source` (string, required) - The image type.
    + offset: `3` (number, optional) - The offset relative to the startFrameIndex of the frameRange of the task.
    + limit: `10` (number, optional) - The maximum number of frameLocations that should be returned.

### Get frame locations [GET]

+ Response 200 (application/json)
    + Attributes
        + result (array[FrameLocation])

## Get the task structures [/api/v1/task/{id}/labelStructure]

+ Parameters
    + id: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Get Structure [GET]

+ Response 200 (application/json)
    + Attributes
        + result (Label Structure)

## Assign a user to a LabelingTask [/api/v1/task/{taskId}/user/{userId}/assign]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + userId: `1` (string, required) - The id of the user.

### Assign a LabelingTask to a user [PUT]

+ Response 200 (application/json)

### Delete a LabelingTask assignment [DELETE]

+ Response 200 (application/json)

## Set Status to done [/api/v1/task/{taskId}/status/done]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set Status to done [POST]

+ Response 200 (application/json)

## Set Status to todo [/api/v1/task/{taskId}/status/todo]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set Status to todo [POST]

+ Response 200 (application/json)

## Set Status to begin [/api/v1/task/{taskId}/status/begin]

Set the task status to in_progress and assign the current user to this task

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set Status to begin [POST]

+ Response 200 (application/json)

## Set Status to reopen [/api/v1/task/{taskId}/status/reopen]

Remove any assignment and set status to todo

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set Status to reopen [POST]

+ Response 200 (application/json)

## Set Status to in_progress [/api/v1/task/{taskId}/status/in_progress]

Remove any assignment and set status to in_progress

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set Status to in_progress [POST]

+ Response 200 (application/json)

## Get sum of Tasks by status [/api/v1/projectCount]

### Sum of Tasks [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + done: `20` (number) - Number of done jobs
            + preprocessing: `30` (number) - Number of preprocessing jobs
            + todo: `40` (number) - Number of todo jobs

## Set attention flag to true [/api/v1/task/{taskId}/attention/enable]

Set attention flag to true

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set attention flag to true [POST]

+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean)
            
## Set attention flag to false [/api/v1/task/{taskId}/attention/disable]

Set attention flag to false

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set attention flag to false [POST]

+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean)

## Change the Task Phase [/api/v1/task/{taskId}/phase]

Change the phase for the task

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Change the Task Phase [PUT]

+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean)
            
## Get the Task Replication DB [/api/v1/task/{taskId}/replication]

Change the phase for the task

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Get the Task Replication DB [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + taskId: `05c1a74d8eda4a16a355519c0f003504` (string)
            + databaseName: `taskdb-project-303e4737cb1ea602d0dfea44ce00b37f-task-303e4737cb1ea602d0dfea44ce02c5e3` (string)
                        
## Get the TaskCount for a Project [/api/v1/taskCount/{projectId}]

+ Parameters
    + projectIdId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the project-entity.

### Get the TaskCount for a Project [GET]

+ Response 200 (application/json)
    + Attributes
        + result (TaskCount)