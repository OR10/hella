# Group Current User

## Get the current user profile [/api/currentUser/profile]

### Get the current user profile [GET]

This routes returns the current user profile data

+ Response 200 (application/json)
    + Attributes
        + result (CurrentUser)

## Current user Profile Picture [/api/currentUser/profile/picture]

### Current user Profile Picture [GET]

Current user Profile Picture

+ Response 200 (image/\*)

    The returned data may be any image type.

    + Attributes

## Change own password [/api/currentUser/password]

### Change own password [PUT]

Change own Password

+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean)

## Get User Permissions [/api/currentUser/permissions]

### Get user permissions [GET]

Get user permissions

+ Response 200 (application/json)
    + Attributes
        + result
            + canViewStatsButton: `true` (boolean)
            + canViewUserListButton: `true` (boolean)
            + canViewVideoUploadButton: `true` (boolean)
            + canViewReopenButton: `true` (boolean)
            + unassignPermission: `true` (boolean)
            + canViewProjectButton: `true` (boolean)

## Get users organisations [/api/currentUser/organisations]

### Get users organisations [GET]

Get all assigned organisations to this user

+ Response 200 (application/json)
    + Attributes
        + result (array[Organisation])