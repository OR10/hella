# Group Status

## Get status [/api/status/{type}/{statusId}]

+ Parameters

    + type: `AppBundle.Model.Interpolation.Status` (string, required) - The type of the status.
    + statusId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the status.

### Get [GET]

+ Response 200 (application/json)

    + Body

            {
                "result": {
                    "id": "16b00780792d045c496513f01f006f09",
                    "status": "success",
                }
            }
