# Group LabeledThing

## All labeled things [/api/task/{taskId}/labeledThing]

+ Parameters

    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task.

### Get all labeled things [GET]

This routes simply returns all labeled things for this task

+ Response 200 (application/json)

    + Body

            {
              "result": {
                "total_rows": 1,
                "offset": 0,
                "rows": [
                  {
                    "id": "e45cfe08f10058433ab917b760013893",
                    "rev": "1-07580eb8891a2ca255a1b7270d12b3f0",
                    "frameRange": [],
                    "classes": [],
                    ...
                    ...
                  }
                ]
              }
            }

### Add a new labeled thing [POST]

Save a new labeled thing for a specified task

+ Response 200 (application/json)

    + Body

            {
              "result": {
                "id": "123jn12jk3j123jk",
                "rev": "1-29fbaf39788de290b3047f1fe8888d0a",
                "frameRange": [],
                ...
                ...
              }
            }

## A labeled thing [/api/task/{taskId}/labeledThing/{labeledThingId}]

+ Parameters

    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task.
    + labeledThingId: `29fbaf39788de290b3047f1fe8888d0a` (string, required) - The id of the labeled Thing document.

### Get a labeled thing [GET]

+ Response 200 (application/json)

    + Body

            {
                "result": {
                    "id": "123jn12jk3j123jk",
                    "rev": "1-29fbaf39788de290b3047f1fe8888d0a",
                    "frameRange": {
                        "startFrameNumber": 1,
                        "endFrameNumber": 100
                    },
                    ...
                }
            }

### Update a labeled thing [PUT]

Update a labeled thing for a specified task

+ Response 200 (application/json)

    + Body

            {
                "result": {
                    "id": "123jn12jk3j123jk",
                    "rev": "1-29fbaf39788de290b3047f1fe8888d0a",
                    "frameRange": {
                        "startFrameNumber": 1,
                        "endFrameNumber": 100
                    },
                    ...
                }
            }

### Delete a labeled thing [DELETE]

DELETE a labeled thing for a specified task. This will also delete all LabeledThingInFrame documents for this labeled thing.

+ Response 200 (application/json)
