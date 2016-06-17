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
+ userId: `3` (number) - The id of the assigned user.
+ frameRange: (FrameRange)

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

## Kitti Export

+ id: `36047d429d50548893be41c6880632fd` (string) - The id of the export entity.
+ taskId: `36047d429d50548893be41c6883f3416` (string) - The id of the referenced task.
+ filename: `kitti.zip` (string) - The filename of the exported data.

## Interpolation Type

+ type: `linear` (string) - The type of the interpolation.

## Interpolation Status

+ id: `e47f4bdfd22883b196ce45a8c980ab68` (string) - The id of the status document.
+ type: `AppBundle.Model.Interpolation.Status` (string) - The type of the status document.
+ status: `success` (string) - The current status.

## Task Timer

+ time: `123456789` (number) - The time (in seconds) a user spend on a certain task.

## CurrentUser

+ id: `1` (number) - The id of the current user.
+ username: `user` (string) - The username of the current user.
+ email: `user@example.com` (string) - The email address of the current user.

## User
 + id: `1` (number) - The id of the current user.
 + username: `user` (string) - The username of the current user.
 + email: `user@example.com` (string) - The email address of the current user.
 + enabled: `true` (boolean) - User enabled or not
 + lastLogin: `2016-01-15T15:42:41+0100` (string)
 + locked: `false` (boolean)
 + roles: `[]` (array)

## Task Statistics

+ task:
    + id: `36047d429d50548893be41c6880632fd` (string) - The id of the task.
    + frameRange: (FrameRange)
+ video:
    + id: `16b00780792d045c496513f01f006f09` (string) - The id of the video.
    + name: `example.avi` (string) - The name of the video.
+ totalLabelingTimeInSeconds: `12345` (number) - The total time in seconds all labelers spent on the task.
+ totalNumberOfLabeledThings: `123` (number) - The total number of LabeledThings of the task.

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

# ProjectExport
+ id: `36047d429d50548893be41c6880632fd` (string) - Export Id
+ projectId: `16b00780792d045c496513f01f006f09` (string) - project id
+ filename: `csv.zip` (string) - export filename
+ taskIds: `583c0838ea5f72671b1b21605c3d6b47` (array[string]) - included task ids for this export

# DimensionPrediction
+ type: `cuboid` (string) - type of the prediction
+ prediction:
    + width: `1` (number) - width of the object
    + height: `1` (number) - width of the object
    + depth: `1` (number) - width of the object