# Group Current User

## Get the current user profile [/api/v1/currentUser/profile]

### Get the current user profile [GET]

Get the current logged in users profile

+ Response 200 (application/json)
    + Attributes
        + result (CurrentUser)

## Current user Profile Picture [/api/v1/currentUser/profile/picture]

### Current user Profile Picture [GET]

Get the current logged in users profile picture

+ Response 200 (image/\*)
    The returned data may be any image type.
    + Attributes

## Change own password [/api/v1/currentUser/password]

### Change own password [PUT]

Change the password of the current logged in user

+ Request (application/json)
    + Attributes
        + oldPassword: `myOldFoobar` (string)
        + newPassword: `myNewFoobar` (string)
    
+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean)

## Get User Permissions [/api/v1/currentUser/permissions]

### Get user permissions [GET]

Get the current logged in users permission list.

+ Response 200 (application/json)
    + Attributes
        + result
            + canViewStatsButton: `true` (boolean)
            + canViewUserListButton: `true` (boolean)
            + canViewVideoUploadButton: `true` (boolean)
            + canViewReopenButton: `true` (boolean)
            + canChangeUserTaskAssignment: `true` (boolean)
            + canViewProjectButton: `true` (boolean)

## Get users organisations [/api/v1/currentUser/organisations]

### Get users organisations [GET]

Get all assigned organisations for the current logged in user

+ Response 200 (application/json)
    + Attributes
        + result (array[Organisation])