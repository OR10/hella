# Group LabeledThingGroup

## Add a new LabeledThingGroup [/api/task/{taskId}/labeledThingGroup]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task.
    + groupType: `some-group-id` (string, required) - groupId.
    + groupIds: `[]` (array) - array of parent group ids.

### Add [POST]

Add a new LabeledThingGroup

+ Response 200 (application/json)
    + Attributes
        + result (array[LabeledThingGroup])

## Delete a LabeledThingGroup [/api/task/{taskId}/labeledThingGroup/{labeledThingGroupId}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task.
    + labeledThingGroupId: `e0d1d6bc7ab7ffa9f698fcda0636c567` (string, required) - The id of the labeledGroupId.

### Delete [DELETE]

Delete a LabeledThingGroup

+ Response 200 (application/json)
    + Attributes
        + result
            + success: `true` (boolean) 

## Get LabeledThingGroupInFrame [/api/task/{taskId}/labeledThingGroupInFrame/frame/{frameIndex}]

+ Parameters
    + taskId: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the task.
    + frameIndex: `22` (string, required) - FrameIndex.

### Get [GET]

GGet all LabeledThingGroupInFrame for a given frameIndex

+ Response 200 (application/json)
    + Attributes
        + result (array[LabeledThingGroupInFrame])