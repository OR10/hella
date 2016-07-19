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

## LabeledFrame [/api/task/{taskId}/labeledFrame/{frameNumber}{?offset,limit}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + frameNumber: `3` (number, required) - The frame number for which the labeled things should be retrieved, added or replaced (number).

### Get [GET]

Return the labeled frame document for this frame number.

If no document exists for this frame, the api will return a copy of the
previous document or an empty document if no document exists for a previous
frame.

In case offset/limit are given as query parameters, a list instead of a single
document is returned.

+ Parameters
    + offset: `3` (number, optional) - The offset relative to the given frameNumber.
    + limit: `10` (number, optional) - The maximum number of labeled frames that should be returned.

+ Response 200 (application/json)
    + Attributes
        + result (LabeledFrame)

### Save or update [PUT]

Save or update a labeled frame. If you want to update a document it is necessary to provide the current revision id.

+ Response 200 (application/json)
    + Attributes
        + result (LabeledFrame)

### Delete [DELETE]

Delete a labeled frame document

+ Response 200 (application/json)
    + Attributes (object)

## K.I.T.T.I. Export [/api/task/{taskId}/export/kitti]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Start K.I.T.T.I. export job [POST]

Start a new export job for the K.I.T.T.I. Object Detection Benchmark format.

+ Response 201 (application/json)
    + Attributes (Export Started Message)

## CSV Export [/api/task/{taskId}/export/csv]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Start a CSV export job [POST]

Start a new csv export job.

+ Response 201 (application/json)
    + Attributes (Export Started Message)

## Task exports [/api/task/{taskId}/export]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### List all task exports [GET]

+ Response 200 (application/json)
    + Attributes
        + result (array[Kitti Export])

## Download Task export [/api/task/{taskId}/export/{taskExportId}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + taskExportId: `36047d429d50548893be41c6880632fd` (string, required) - The id of the task-export-entity.

### Download [GET]

+ Response 200 (mixed)

    The Raw data of the exported data. The actual content type depends on the type of export.
    In case of the K.I.T.T.I. Object Detection Benchmark export, it is a zip archive containing one textfile for each frame containing object types and their bounding boxes.

    + Attributes

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

## Set Status to Labeled [/api/task/{taskId}/status/labeled]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set Status to Labeled [POST]

+ Response 200 (application/json)

## Set Status to waiting [/api/task/{taskId}/status/waiting]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Set Status to waiting [POST]

+ Response 200 (application/json)
