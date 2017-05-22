# Group Task

## List all tasks [/api/task{?includeVideos}]

### Get a list of all tasks [GET]

+ Parameters
    + includeVideos: `false` (boolean, optional) - Wether or not the referenced video entities should be included in the response.
    + offset: `10` (number, optional) - Set an offset
    + limit: `5` (number, optional) - Limit the number is tasks
    + taskStatus: `labeled` (string, optional) - Fetch only tasks with a given status
    + project: `02b531ffe2c35ee965e4b339a61c7ad2` (string, optional) - Limit the task list to a projectId

+ Response 200 (application/json)
    + Attributes
        + result
            + array[Task]

## Get a specific task [/api/task/{id}]

+ Parameters
    + id: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Get task [GET]

+ Response 200 (application/json)
    + Attributes
        + result (Task)

## Get frame locations of a task [/api/task/{taskId}/frameLocations/{type}{?offset,limit}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f002ee6` (string, required) - The id of the task-entity.
    + type: `source` (string, required) - The image type.
    + offset: `3` (number, optional) - The offset relative to the startFrameIndex of the frameRange of the task.
    + limit: `10` (number, optional) - The maximum number of frameLocations that should be returned.

### Get frame locations [GET]

+ Response 200 (application/json)
    + Attributes
        + result (array[FrameLocation])

## LabeledThingInFrame [/api/task/{taskId}/labeledThingInFrame/{frameNumber}/{labeledThingId}{?offset,limit,includeGhosts}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + frameNumber: `3` (number, required) - The frame number for which the labeled things should be retrieved, added or replaced (number).
    + labeledThingId: `05c1a74d8eda4a16a355519c0f002ee6` (string, required) - The id of the labeled-thing-entity.
    + offset: `3` (number, optional) - The offset relative to the given frameNumber.
    + limit: `10` (number, optional) - The maximum number of results.
    + includeGhosts: `true` (boolean, optional) - Wether or not ghosts should be created for frame without labeled things in frame.

### Get labeled things [GET]

+ Response 200 (application/json)
    + Attributes
        + result (array[LabeledThingInFrame])

## LabeledThingInFrame [/api/task/{taskId}/labeledThingInFrame]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + incompleteOnly: `true` (boolean, optional) - Only return incomplete labeledThingInFrames.
    + limit: `10` (number, optional) - The maximum number of labeled things in frame that should be returned.

### Get labeled things in frame for task [GET]

Return all labeled thing in frame for a task

+ Parameters
    + incompleteOnly: `true` (boolean, optional) - Only return incomplete labeledThingInFrames.
    + limit: `10` (number, optional) - The maximum number of labeled things in frame that should be returned.

+ Response 200 (application/json)
    + Attributes
        + result
            + labeledThingsInFrame (array[LabeledThingInFrame])

## LabeledThingInFrame [/api/task/{taskId}/labeledThingInFrame/{frameNumber}{?offset,limit}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + frameNumber: `3` (number, required) - The frame number for which the labeled things should be retrieved, added or replaced (number).

### Get labeled things in frame [GET]

Each returned labeled thing in frame contains a revision.
A subsequent PUT request will only be accepted if the labeled thing still has
the same revision.

By default, all associated labeled things are also returned. This can be
controlled by a query parameter `labeledThings` which may be set to `false`
when the associated labeled things are not required.

+ Parameters
    + offset: `3` (number, optional) - The offset relative to the given frameNumber.
    + limit: `10` (number, optional) - The maximum number of labeled things in frame that should be returned.

+ Response 200 (application/json)
    + Attributes
        + result
            + labeledThings
                + 36047d429d50548893be41c6880632fd (LabeledThing)
            + labeledThingsInFrame (array[LabeledThingInFrame])

### Create a new labeled thing [POST]

+ Request (application/json)
    + Attributes (LabeledThing)

+ Response 200 (application/json)
    + Attributes (object)

## Interpolate labeled things in frame [/api/task/{taskId}/interpolate/{labeledThingId}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + labeledThingId: `36047d429d50548893be41c6880632fd` (string, required) - The id of the labeled-thing-entity.

### Start interpolation [POST]

+ Request (application/json)
    + Attributes
        + type: `linear` (string, required) - The type of interpolation that should be performed.

+ Response 200 (application/json)
    + Attributes
        + result (Interpolation Status)

## Timer [/api/task/{taskId}/timer/{userId}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + userId: `3` (number, required) - The id of the user-entity.

### Read timer value of a user [GET]

+ Response 200 (application/json)
    + Attributes
        + result (Task Timer)

### Set timer value for a user [PUT]

+ Request (application/json)
    + Attributes (Task Timer)

+ Response 200 (application/json)
    + Attributes
        + result (Task Timer)

+ Response 403 (application/json)
    + Attributes (object)

## Get the task structures [/api/task/{id}/labelStructure]

+ Parameters
    + id: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Get Structure [GET]

+ Response 200 (application/json)
    + Attributes
        + result (Label Structure)

## Assign a user to a LabelingTask [/api/task/{taskId}/user/{userId}/assign]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + userId: `1` (string, required) - The id of the user.

### Assign a LabelingTask to a user [PUT]

+ Response 200 (application/json)

### Delete a LabelingTask assignment [DELETE]

+ Response 200 (application/json)

## Set Status to done [/api/task/{taskId}/status/done]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set Status to done [POST]

+ Response 200 (application/json)

## Set Status to todo [/api/task/{taskId}/status/todo]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set Status to todo [POST]

+ Response 200 (application/json)

## Set Status to begin [/api/task/{taskId}/status/begin]

Set the task status to in_progress and assign the current user to this task

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set Status to begin [POST]

+ Response 200 (application/json)

## Set Status to reopen [/api/task/{taskId}/status/reopen]

Remove any assignment and set status to todo

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set Status to reopen [POST]

+ Response 200 (application/json)

## Get sum of Tasks by status [/api/projectCount]

### Sum of Tasks [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + done: `20` (number) - Number of done jobs
            + preprocessing: `30` (number) - Number of preprocessing jobs
            + todo: `40` (number) - Number of todo jobs

## Set attention flag to true [/api/task/{taskId}/attention/enable]

Set attention flag to true

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set attention flag to true [POST]

+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean)
            
## Set attention flag to false [/api/task/{taskId}/attention/disable]

Set attention flag to false

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set attention flag to false [POST]

+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean)

## Change the Task Phase [/api/task/{taskId}/phase]

Change the phase for the task

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Change the Task Phase [PUT]

+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean)
            
## Get the Task Replication DB [/api/task/{taskId}/replication]

Change the phase for the task

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Get the Task Replication DB [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + taskId: `05c1a74d8eda4a16a355519c0f003504` (string)
            + databaseName: `taskdb-project-303e4737cb1ea602d0dfea44ce00b37f-task-303e4737cb1ea602d0dfea44ce02c5e3` (string)