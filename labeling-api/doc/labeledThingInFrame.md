# Group LabeledThingInFrame

## LabeledThingInFrame [/api/labeledThingInFrame/{id}]

+ Parameters

    + id: `05c1a74d8eda4a16a355519c0f002ee6` (string, required) - The id of the labeled thing in frame.

### Get [GET]

+ Response 200 (application/json)

    + Body

            {
                "id": "05c1a74d8eda4a16a355519c0f002ee6",
                "rev": "1-f7136e3d4bca3ced9faa3c174c1c3d05",
                "shapes": [
                    ...
                ]
            }

### Replace [PUT]

+ Request (application/json)

    + Body

            {
                "id": "05c1a74d8eda4a16a355519c0f002ee6",
                "rev": "1-f7136e3d4bca3ced9faa3c174c1c3d05",
                "shapes": [
                    ...
                ]
            }

+ Response 200 (application/json)

    + Body

            {
            }

+ Response 409 (application/json)

    In case of a revision conflict.

    + Body

            {
            }

### Remove [DELETE]

+ Request (application/json)

    + Body

            {
                "id": "05c1a74d8eda4a16a355519c0f002ee6",
                "rev": "1-f7136e3d4bca3ced9faa3c174c1c3d05",
                "shapes": [
                    ...
                ]
            }

+ Response 200 (application/json)

    + Body

            {
            }

+ Response 409 (application/json)

    In case of a revision conflict.

    + Body

            {
            }
