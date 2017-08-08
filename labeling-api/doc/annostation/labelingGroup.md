# Group Labeling Groups

A Labeling-Group is a Group of Labelers and one LabelCoordinator. A LabelGroup can have several project assignments.

## Get a Labeling Group List [/api/v1/organisation/{organisationId}/labelingGroup]

Get all labeling-groups for an organisation

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    
### Get a Labeling Group List [GET]

+ Response 200 (application/json)
    + Attributes
        + totalRows: `0` (number)
        + result
            + labelingGroups array(LabelingGroup)
            + users array(User)
        
## Get a Labeling Group [/api/v1/organisation/{organisationId}/labelingGroup/{labelingGroupId}]

Get a single LabelGroup

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + labelingGroupId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Get a single Labeling Group [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + labelingGroups (LabelingGroup)
            + users array(User)

## Add a new Labeling Group [/api/v1/organisation/{organisationId}/labelingGroup]

Add a new LabelingGroup to an organisation

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.

### Add a new Labeling Group [POST]

+ Request (application/json)
    + Attributes
        + coordinators: `672b8a8a6b3103f25318a5c4be00a325` (array)
        + labeler: `43367aa94690546d066c6e25b26de099` (array)
        + name: `Berlin Group #1` (string)

+ Response 200 (application/json)
    + Attributes
        + result
            + labelingGroups (LabelingGroup)
            + users array(User)

## Update a Labeling Group [/api/v1/organisation/{organisationId}/labelingGroup/{labelingGroupId}]

Update a LabelingGroup

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + labelingGroupId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Update a Labeling Group [PUT]

+ Request (application/json)
    + Attributes
        + id: `672b8a8a6b3103f25318a5c4be009c7e`
        + _rev: `3-1e41bd314fe55a9c3949230aa463943b`
        + coordinators: `672b8a8a6b3103f25318a5c4be00a325` (array)
        + labeler: `43367aa94690546d066c6e25b26de099` (array)
        + name: `Berlin Group #1` (string)

+ Response 200 (application/json)
    + Attributes
        + result
            + labelingGroups (LabelingGroup)
            + users array(User)

## Delete a Labeling Group [/api/v1/organisation/{organisationId}/labelingGroup/{labelingGroupId}]

Delete a LabelingGroup

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    + labelingGroupId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Delete a Labeling Group [DELETE]

+ Response 200 (application/json)
    + Attributes
        + result: true
        
## My Labeling Group [/api/v1/organisation/{organisationId}/labelingGroup/user/groups]

Get all LabelingGroups of the current logged in User

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    
### My Labeling Group [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(LabelingGroup)

## Get all Coordinators [/api/v1/organisation/{organisationId}/labelingGroup/user/coordinators]

Get all LabelCoordinator for a LabelGroup

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
    
### Get all Coordinators [GET]

+ Response 200 (application/json)
    + Attributes
        + result
            + id:`36047d429d50548893be41c6880632fd` (string) - The id of the user.
            + username: `Christian` (string) - username of the user