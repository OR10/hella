# Group Labeling Groups

## Get a Labeling Group List [/api/labelingGroup]

### Get a Labeling Group List [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(LabelingGroup)
        
## Get a Labeling Group [/api/labelingGroup/{labelingGroupId}]

+ Parameters
    + labelingGroupId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Get a Labeling Group [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(LabelingGroup)

## Add a new Labeling Group [/api/labelingGroup]

### Add a new Labeling Group [POST]

+ Response 200 (application/json)
    + Attributes
        + result (LabelingGroup)

## Update a Labeling Group [/api/labelingGroup/{labelingGroupId}]

+ Parameters
    + labelingGroupId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Update a Labeling Group [PUT]
+ Request (application/json)
    + Attributes (LabelingGroup)

+ Response 200 (application/json)
    + Attributes
        + result (LabelingGroup)

## Delete a Labeling Group [/api/labelingGroup/{labelingGroupId}]

+ Parameters
    + labelingGroupId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Delete a Labeling Group [DELETE]

+ Response 200 (application/json)
    + Attributes
        + result: true
        
## My Labeling Group [/api/labelingGroup/user/groups]

### My Labeling Group [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(LabelingGroup)

## Get all Coordinators [/api/labelingGroup/user/coordinators]

### Get all Coordinators [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + id:`36047d429d50548893be41c6880632fd` (string) - The id of the user.
            + username: `Christian` (string) - username of the user