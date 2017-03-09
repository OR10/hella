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
                        
## Assign a user to an organisation [/api/organisation/{organisationId}/user/{userId}/assign]

+ Parameters
    + organisationId: `05c1a74d8eda4a16a355519c0f002ee6` (string, required) - The id of the Organisation.
    + userId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the User.

### Assign from Organisation [PUT]

+ Response 200 (application/json)
    + Attributes
        + success: `true` (boolean)   
                             
## Unassign a user from an organisation [/api/organisation/{organisationId}/user/{userId}/unassign]

+ Parameters
    + organisationId: `05c1a74d8eda4a16a355519c0f002ee6` (string, required) - The id of the Organisation.
    + userId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the User.

### Unassign from Organisation [DELETE]

+ Response 200 (application/json)
    + Attributes
        + success: `true` (boolean)