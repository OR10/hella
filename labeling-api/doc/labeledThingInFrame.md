# Group LabeledThingInFrame

## LabeledThingInFrame [/api/labeledThingInFrame/{id}]

+ Parameters
    + id: `05c1a74d8eda4a16a355519c0f002ee6` (string, required) - The id of the labeled thing in frame.

### Get [GET]

+ Response 200 (application/json)
    + Attributes
        + result (LabeledThingInFrame)

## LabeledThingInFrame [/api/labeledThingInFrame{?incompleteOnly}{?limit}]

### Get [GET]

+ Parameters
    + incompleteOnly: `false` (boolean, optional) - Only return incomplete LabeledThingsInFrame - Default is false
    + limit: `10` (string, optional) - limit the number of labeledFrames

+ Response 200 (application/json)
    + Attributes
       + result (LabeledThingInFrame)

### Replace [PUT]

+ Request (application/json)
    + Attributes (LabeledThingInFrame)

+ Response 200 (application/json)
    + Attributes
        + result
            + labeledThing (LabeledThing)
            + labeledThingInFrame (LabeledThingInFrame)

+ Response 409 (application/json)

    In case of a revision conflict.

    + Attributes (object)

### Remove [DELETE]

+ Request (application/json)
    + Attributes (LabeledThingInFrame)

+ Response 200 (application/json)
    + Attributes
        + success: `true` (boolean)

+ Response 409 (application/json)

    In case of a revision conflict.

    + Attributes (object)
