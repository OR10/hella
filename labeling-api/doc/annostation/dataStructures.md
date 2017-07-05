# Data structures

## Video Metadata

+ duration: `47.23` (number) - The duration of the video (in seconds).
+ height: `480` (number) - The height of the video (in pixels).
+ width: `640` (number) - The width of the video (in pixels).

## FrameRange

+ startFrameIndex: `1` (number) - The first frame number of the frame range.
+ endFrameIndex: `23` (number) - The last frame number of the frame range.

## Video

+ id: `16b00780792d045c496513f01f006f09` (string) - The id of the video.
+ name: `example.avi` (string) - The name of the video.
+ metaData: (Video Metadata) - The meta data of the video.

## Task

+ id: `05c1a74d8eda4a16a355519c0f002ee6` (string) - The id of the task.
+ descriptionTitle: `Identify the person` (string) - Title of the Task
+ descriptionText: `How is the view on the person? Which side does one see from the person and from which side is the person entering the screen?` (string) - Task description
+ requiredImageTypes: `sourceJpg` (array) - List of the required images types
+ status:
    + preprocessing: `done` (string) - status of the preprocessing type
    + labeling: `in_progress` (string) - status of the labeling type
+ taskType: `object-labeling` (string) - Task type
+ drawingToolOptions:
    + pedestrian:
        + minimalHeight: `22`(number) - The minimal pedestrian height
    + cuboid:
        + minimalHeight: `15`(number) - The minimal cuboid height
    + polygon:
        + minHandles: `3`(number) - Min number of handles
        + maxHandles: `15`(number) - Max number of handles
+ labelInstruction: `miscellaneous` (string) - label instruction type
+ frameNumberMapping: `3` (array) - The frameNumberMapping
+ metaData:
    + frameRange: (FrameRange)
    + frameSkip: `1` (number) - Number of frames to skip
    + startFrameNumber: `22` (number) - Start framenumber
+ createdAt: `2017-05-16T12:15:01+0200` (string) - Task creation date
+ video: (Video)
+ project: (Project)
+ users: (array)
    - (User)

## FrameLocation

+ frameNumber: `1` (number) - The frame number of the location.
+ url: `https://backend/path/to/frame` (string) - The url where the image for the location can be found.

## LabeledFrame

+ id: `36047d429d50548893be41c6880632fd` (string) - The id of the LabeledThingInFrame.
+ rev: `1-36047d429d50548893be41c6880632fd` (string) - The revision of the LabeledThingInFrame.
+ taskId: `05c1a74d8eda4a16a355519c0f002ee6` (string) - The id of the referenced task.
+ frameNumber: `3` (number) - The frame number of this LabeledFrame.
+ classes: `sunny` (array[string]) - Array of assigned classes.
+ incomplete: `true` (boolean) - Wether or not the LabeledFrame is completly labeled.

## LabeledThing
+ id: `36047d429d50548893be41c6880632fd` (string) - The id of the LabeledThingInFrame.
+ rev: `1-36047d429d50548893be41c6880632fd` (string) - The revision of the LabeledThingInFrame.
+ taskId: `05c1a74d8eda4a16a355519c0f002ee6` (string) - The id of the referenced task.
+ frameRange: (FrameRange)
+ classes: `pedestrian` (array[string]) - Array of assigned classes.
+ incomplete: `true` (boolean) - Wether or not the LabeledThing is completly labeled.
+ lineColor: `1` (string)

## Shape

+ id: `f144490a-b31c-4eee-a26b-d0d2cd4a9f4b` (string) - The id of the shape.
+ type: `rectangle` (string) - The type of the shape.
+ bottomRight
    + x: `10` (number)
    + y: `10` (number)
+ topLeft
    + x: `5` (number)
    + y: `5` (number)

## LabeledThingInFrame

+ id: `36047d429d50548893be41c6880632fd` (string) - The id of the LabeledThingInFrame.
+ rev: `1-36047d429d50548893be41c6880632fd` (string) - The revision of the LabeledThingInFrame.
+ labeledThingId: `36047d429d50548893be41c6880632fd` (string) - The id of the referenced LabeledThing.
+ frameNumber: `3` (number) - The frame number of this LabeledThingInFrame.
+ incomplete: `true` (boolean) - Wether or not the LabeledThingInFrame is completly labeled.
+ ghost: `false` (boolean) - Wether or not the LabeledThingInFrame is a ghost.
+ classes: `pedestrian` (array[string]) - Array of assigned classes.
+ shapes: (array[Shape]) - Array of assigned shapes of the labeled object.

## Export Started Message

+ message: `Export started` (string)

## CurrentUser

+ id: `1` (number) - The id of the current user.
+ username: `user` (string) - The username of the current user.
+ email: `user@example.com` (string) - The email address of the current user.

## User
 + id: `1` (number) - The id of the current user.
 + _rev: `1-36047d429d50548893be41c6880632fd` (number) - Document revision.
 + username: `user` (string) - The username of the current user.
 + email: `user@example.com` (string) - The email address of the current user.
 + enabled: `true` (boolean) - User enabled or not
 + lastLogin: `2016-01-15T15:42:41+0100` (string)
 + locked: `false` (boolean)
 + roles: `[]` (array)

## Label Structure
+ structure:
    + name: `root`
    + children:
        + name: `pedestrian`
        + children: `...`
+ annotation:
    + pedestrian:
        + response: `Pedestrian`
        + iconClass: `icon-area-residential`
    + cyclist:
        + response: `Cyclist`
        + iconClass: `icon-area-residential`

# Project
+ id: `36047d429d50548893be41c6880632fd` (string) - Project ID
+ name: `Pedestrian Labeling` (string) - Project Name
+ taskCount: `5` (number) - Number of total tasks inside all projects
+ taskFinishedCount: `1` (number) - Number of total finished tasks inside all projects
+ totalLabelingTimeInSeconds: `3124` (number) - Seconds spend by users in this project

# ProjectExport
+ id: ``
+ projectId: `16b00780792d045c496513f01f006f09` (string) - project id
+ filename: `csv.zip` (string) - export filename
+ taskIds: `583c0838ea5f72671b1b21605c3d6b47` (array[string]) - included task ids for this export
    
# LabelingGroup
+ id: `36047d429d50548893be41c6880632fd` (string) - Labeling Group ID
+ rev: `1-36047d429d50548893be41c6880632fd` (string) - The Revision of the Labeling Group
+ coordinators: `672b8a8a6b3103f25318a5c4be00a325` (array) - Array of the coordinator IDs
+ labelers: `43367aa94690546d066c6e25b26de099` (array) - Array of the labelers IDs
+ users: (array[User])

# Report
+ id: `36047d429d50548893be41c6880632fd` (string) - Labeling Group ID
+ rev: `1-36047d429d50548893be41c6880632fd` (string) - The Revision of the Labeling Group
+ reportStatus: `in_progress` (string)
+ projectId: `in_315c18731e6a3989d933017a1e47b1dd` (string)
+ projectStatus: `` (string)
+ projectCreatedAt: `1468379894` (number)
+ projectMovedToInProgressAt: `1468379894` (number)
+ projectMovedToDoneAt: `1468379894` (number)
+ numberOfVideosInProject: `130` (number)
+ numberOfTasksInProject: `390` (number)
+ projectLabelType: `` (string)
+ projectDueDate: `1468379894` (number)
+ numberOfToDoTasks: `0` (number)
+ numberOfInProgressTasks: `0` (number)
+ numberOfDoneTasks: `390` (number)
+ numberOfToDoReviewTasks: `0` (number)
+ numberOfInProgressReviewTasks: `0` (number)
+ numberOfDoneReviewTasks: `0` (number)
+ numberOfToDoRevisionTasks: `0` (number)
+ numberOfInProgressRevisionTasks: `0` (number)
+ numberOfDoneRevisionTasks: `0` (number)
+ numberOfLabeledThingInFrames: `15783` (number)
+ numberOfLabeledThingInFrameClasses: `32819` (number)
+ numberOfLabeledThings: `4537` (number)
+ numberOfLabeledThingClasses: `4537` (number)
+ totalTime: `460990` (number)
+ totalLabelingTime: `0` (number)
+ totalReviewTime: `0` (number)
+ totalRevisionTime: `0` (number)

# TaskConfiguration
+ id: `36047d429d50548893be41c6880632fd` (string) - Labeling Group ID
+ rev: `1-36047d429d50548893be41c6880632fd` (string) - The Revision of the Labeling Group
+ json: `[]` (array) - Instruction and Shape defaults
+ name: `Some Name` (string) - Name of this configuration file
+ timestamp: `234523523` (number) - Creation Date for this config
+ userId : `583c0838ea5f72671b1b21605c3d6b47` (string) - Creators UserId

# LabeledThingGroup
+ id: `36047d429d50548893be41c6880632fd` (string) - LabeledThingGroup ID
+ rev: `1-36047d429d50548893be41c6880632fd` (string) - The Revision of the LabeledThingGroup
+ groupType: `some-group-id` (string) - the type of the group (id)
+ groupIds: `[]` (array) - Parent group ids

# LabeledThingGroupInFrame
+ id: `36047d429d50548893be41c6880632fd` (string) - LabeledThingGroup ID
+ rev: `1-36047d429d50548893be41c6880632fd` (string) - The Revision of the LabeledThingGroup
+ frameIndex: `frame index` (string) - Frame Index
+ classes: `[]` (array) - Labeled classes

# Organisation
+ id: `36047d429d50548893be41c6880632ee` (string) - Organisation ID
+ rev: `1-36047d429d50548893be41c6880632gg` (string) - The Revision of the Organisation
+ name: `Some Organisation` (string) - Organisation Name
+ quota: `Quota` (number) - Quota in bytes. 0 bytes no limit

# Campaign
+ id: `36047d429d50548893be41c6880632ee` (string) - Campaign ID
+ rev: `1-36047d429d50548893be41c6880632gg` (string) - The Revision of the Campaign
+ name: `Some Campaign` (string) - Campaign Name
+ organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string) - ID of the Organisation

# TaskCount
+ preprocessing:
    + todo: `0`
    + in_progress: `0`
    + done: `0`
    + waiting_for_precondition: `0`
    + failed: `0`
+ labeling:
    + todo: `0`
    + in_progress: `0`
    + done: `0`
    + waiting_for_precondition: `0`
    + failed: `0`
+ review:
    + todo: `0`
    + in_progress: `0`
    + done: `0`
    + waiting_for_precondition: `0`
    + failed: `0`
+ revision:
    + todo: `0`
    + in_progress: `0`
    + done: `0`
    + waiting_for_precondition: `0`
    + failed: `0`
+ all_phases_done: `0`