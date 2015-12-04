# Group Current User

## Get the current user profile [/api/user/profile]

### Get the current user profile [GET]

This routes returns the current user profile data

+ Response 200 (application/json)

    + Body

            {
              "result": [
                {
                    "id":1,
                    "username":"user",
                    "email":"user@example.com"
                    ...
                }
              ]
            }

## Current user Profile Picture [/api/user/profile/picture]

### Current user Profile Picture [GET]

Current user Profile Picture

+ Response 200 (application/json)
