# Group Task

## List all tasks [/api/task]

### Get a list of all tasks [GET]

+ Response 200 (application/json)

    + Body

            {
                "totalCount": 5,
                "result": [
                    {
                        "id": "05c1a74d8eda4a16a355519c0f002ee6",
                        "userId": 5,
                        "frameRange": {
                            "startFrameNumber": 8,
                            "endFrameNumber": 14
                        }
                    },
                    {
                        "id": "05c1a74d8eda4a16a355519c0f003504",
                        "userId": 3,
                        "frameRange": {
                            "startFrameNumber": 3,
                            "endFrameNumber": 12
                        }
                    },
                    ...
                ]
            }

## Get a specific task [/api/task/{id}]

+ Parameters

    + id: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Get task [GET]

+ Response 200 (application/json)

    + Body

            {
                "result": {
                    "id": "05c1a74d8eda4a16a355519c0f002ee6",
                    "userId": 5,
                    "frameRange": {
                        "startFrameNumber": 8,
                        "endFrameNumber": 14
                    }
                }
            }

## Get frame locations of a task [/api/task/{taskId}/frameLocations/{type}{?offset,limit}]

+ Parameters

    + taskId: `05c1a74d8eda4a16a355519c0f002ee6` (string, required) - The id of the task-entity.
    + type: `source` (string, required) - The image type.
    + offset: `3` (int, optional) - The offset relative to the startFrameNumber of the frameRange of the task.
    + limit: `10` (int, optional) - The maximum number of frameLocations that should be returned.

### Get frame locations [GET]

+ Response 200 (application/json)

    + Body

            {
                "result": [
                    {
                        "id": "05c1a74d8eda4a16a355519c0f002ee6-8",
                        "frameNumber": 8,
                        "url": "http:\/\/192.168.222.20:81\/\/source\/8.png"
                    }
                ]
            }

## LabeledThingInFrame [/api/task/{taskId}/labeledThingInFrame/{frameNumber}]

+ Parameters

    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + frameNumber: `3` (int, required) - The frame number for which the labeled things should be retrieved, added or replaced (int).

### Get labeled things [GET]

Each returned labeled thing contains a revision.
A subsequent PUT request will only be accepted if the labeled thing still has
the same revision.

+ Response 200 (application/json)

    + Body

            {
                "result": [
                    {
                        "id": "...",
                        "rev": "...",
                        "shapes": [
                            ...
                        ]
                    }
                ]
            }

### Create a new labeled thing [POST]

+ Request (application/json)

    + Body

            {
                "shapes": [
                    ...
                ]
            }

+ Response 200 (application/json)

    + Body

            {
            }

## LabeledFrame [/api/task/{taskId}/labeledFrame/{frameNumber}]

+ Parameters

    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + frameNumber: `3` (int, required) - The frame number for which the labeled things should be retrieved, added or replaced (int).

### Get [GET]

Return the labeled frame document for this frame number. If no document exists for this frame the api will return the next existing previous frame.

+ Response 200 (application/json)

    + Body

            {
                "result": [
                    {
                        "id": "...",
                        "rev": "...",
                        "classes": [
                            ...
                        ]
                    }
                ]
            }

### Save or update [PUT]

Save or update a labeled frame. If you want to update a document it is necessary to provide the current revision id.

+ Response 200 (application/json)

    + Body

            {
                "result": [
                    {
                        "id": "...",
                        "rev": "...",
                        "classes": [
                            ...
                        ]
                    }
                ]
            }

### Delete [DELETE]

Delete a labeled frame document

+ Response 200 (application/json)


## K.I.T.T.I. Export [/api/task/{taskId}/export/kitti]

+ Parameters

    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### Start K.I.T.T.I. export job [POST]

Start a new export job for the K.I.T.T.I. Object Detection Benchmark format.

+ Response 201 (application/json)

    + Body

            {
                "message": "Export started"
            }

## Task exports [/api/task/{taskId}/export]

+ Parameters

    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.

### List all task exports [GET]

+ Response 200 (application/json)

    + Body

            {
                "totalCount": 3,
                "result": [
                    {
                        "id": "36047d429d50548893be41c6880632fd",
                        "taskId": "36047d429d50548893be41c6883f3416",
                        "filename": "kitti.zip"
                    },
                    ...
                ]
            }

## Download Task export [/api/task/{taskId}/export/{taskExportId}]

+ Parameters

    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + taskExportId: `36047d429d50548893be41c6880632fd` (string, required) - The id of the task-export-entity.

### Download [GET]

+ Response 200 (mixed)

    The Raw data of the exported data. The actual content type depends on the type of export.
    In case of the K.I.T.T.I. Object Detection Benchmark export, it is a zip archive containing one textfile for each frame containing object types and their bounding boxes.

    + Body
