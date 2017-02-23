# Group Users

## List all users [/api/user]

### Get a list of all users [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + user (array[User])

## Add a new user [/api/user]

### Add a new user [POST]

+ Response 200 (application/json)
    + Attributes
        + result
            + user (User)

## Get a specific user [/api/user/{id}]

+ Parameters
    + id: `1` (string, required) - The id of the user-entity.

### Get a user [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + user (User)

## Edit a specific user [/api/user/{id}]

+ Parameters
    + id: `1` (string, required) - The id of the user-entity.

### Edit a user [PUT]

+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean)

## Delete a specific user [/api/user/{id}]

+ Parameters
    + id: `1` (string, required) - The id of the user-entity.

### Delete a user [DELETE]

+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean)