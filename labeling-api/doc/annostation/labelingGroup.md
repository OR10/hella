# Group Labeling Groups

## Get a Labeling Group List [/api/organisation/{organisationId}/labelingGroup]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    
### Get a Labeling Group List [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(LabelingGroup)
        
## Get a Labeling Group [/api/organisation/{organisationId}/labelingGroup/{labelingGroupId}]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + labelingGroupId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Get a Labeling Group [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(LabelingGroup)

## Add a new Labeling Group [/api/organisation/{organisationId}/labelingGroup]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.

### Add a new Labeling Group [POST]

+ Response 200 (application/json)
    + Attributes
        + result (LabelingGroup)

## Update a Labeling Group [/api/organisation/{organisationId}/labelingGroup/{labelingGroupId}]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + labelingGroupId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Update a Labeling Group [PUT]
+ Request (application/json)
    + Attributes (LabelingGroup)

+ Response 200 (application/json)
    + Attributes
        + result (LabelingGroup)

## Delete a Labeling Group [/api/organisation/{organisationId}/labelingGroup/{labelingGroupId}]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + labelingGroupId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Delete a Labeling Group [DELETE]

+ Response 200 (application/json)
    + Attributes
        + result: true
        
## My Labeling Group [/api/organisation/{organisationId}/labelingGroup/user/groups]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    
### My Labeling Group [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(LabelingGroup)

## Get all Coordinators [/api/organisation/{organisationId}/labelingGroup/user/coordinators]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    
### Get all Coordinators [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + id:`36047d429d50548893be41c6880632fd` (string) - The id of the user.
            + username: `Christian` (string) - username of the user