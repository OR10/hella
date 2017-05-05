# Group LabeledThing

## All labeled things [/api/task/{taskId}/labeledThing{?incompleteOnly}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task.

### Get all labeled things [GET]

This routes simply returns all labeled things for this task

+ Parameters
    + incompleteOnly: `false` (boolean, optional) - Only return incomplete LabeledThings - Default is false

+ Response 200 (application/json)
    + Attributes
        + result (array[LabeledThing])

### Add a new labeled thing [POST]

Save a new labeled thing for a specified task

+ Request (application/json)
    + Attributes (LabeledThing)

+ Response 200 (application/json)
    + Attributes
        result (LabeledThing)

## A labeled thing [/api/task/{taskId}/labeledThing/{labeledThingId}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task.
    + labeledThingId: `29fbaf39788de290b3047f1fe8888d0a` (string, required) - The id of the labeled Thing document.

### Get a labeled thing [GET]

+ Response 200 (application/json)
    + Attributes
        + result (LabeledThing)

### Update a labeled thing [PUT]

Update a labeled thing for a specified task

+ Request (application/json)
    + Attributes (LabeledThing)

+ Response 200 (application/json)
    + Attributes
        + result (LabeledThing)

### Delete a labeled thing [DELETE]

DELETE a labeled thing for a specified task. This will also delete all LabeledThingInFrame documents for this labeled thing.

+ Response 200 (application/json)
    + Attributes
        + success: `true` (boolean)

## Get incomplete LabeledThings count [/api/task/{taskId}/labeledThingsIncompleteCount]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task.

### Get incomplete LabeledThings count [GET]

+ Response 200 (application/json)
    + Attributes
        + result:
            + count: 10