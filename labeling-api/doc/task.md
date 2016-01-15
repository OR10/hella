# Group Task

## List all tasks [/api/task{?includeVideos}]

### Get a list of all tasks [GET]

+ Parameters

    + includeVideos: `false` (boolean, optional) - Wether or not the referenced video entities should be included in the response.

+ Response 200 (application/json)

    + Body

            {
                "result": {
                    "tasks": [
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
                        }
                    ],
                    "videos": {
                        "<videoId>": {
                            ...
                        }
                    }
                }
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
    + offset: `3` (number, optional) - The offset relative to the startFrameNumber of the frameRange of the task.
    + limit: `10` (number, optional) - The maximum number of frameLocations that should be returned.

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

    + Body

            {
                "result": [
                    {
                        "id": "...",
                        "rev": "...",
                        "labeledThingId": "05c1a74d8eda4a16a355519c0f002ee6",
                        "classes": [...],
                        "shapes": [
                            ...
                        ]
                    },
                    ...
                ]
            }


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

    + Body

            {
                "result": {
                    "labeledThings": {
                        "<labeledThingId>": {
                            ...
                        }
                    },
                    "labeledThingsInFrame": [
                        {
                            "id": "...",
                            "rev": "...",
                            "shapes": [
                                ...
                            ]
                        }
                    ],
                }
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

    + Body

            {
                "result": {
                    "id": "...",
                    "rev": "...",
                    "classes": [
                        ...
                    ]
                }
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

## Interpolate labeled things in frame [/api/task/{taskId}/interpolate/{labeledThingId}]

+ Parameters

    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + labeledThingId: `36047d429d50548893be41c6880632fd` (string, required) - The id of the labeled-thing-entity.

### Start interpolation [POST]

+ Request (application/json)

    + Attributes

        + type: `linear` (string, required) - The type of interpolation that should be performed.

    + Body

            {
                "type": "linear"
            }

+ Response 200 (application/json)

    + Body

            {
                "id": "e47f4bdfd22883b196ce45a8c980ab68",
                "type": "AppBundle.Model.Interpolation.Status"
            }

## Timer [/api/task/{taskId}/timer/{userId}]

+ Parameters

    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task-entity.
    + userId: `3` (number, required) - The id of the user-entity.

### Read timer value of a user [GET]

+ Response 200 (application/json)

    + Body

            {
                "result": {
                    "time": 1234567890
                }
            }


### Set timer value for a user [PUT]

+ Request (application/json)

    + Attributes

        + time: `1234567890` (number, required) - The time in seconds since the beginning of the unix epoch.

    + Body

            {
                "time": 1234567890
            }


+ Response 200 (application/json)

    + Body

            {
                "result": {
                    "time": 1234567890
                }
            }

+ Response 403 (application/json)

    + Body

            {
            }
