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

## Get frame locations of a task [/api/task/{taskId}/frameLocations/{type}]

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

## LabeledThingsInFrame [/api/task/{taskId}/labeledThingInFrame/{frameNumber}]

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
