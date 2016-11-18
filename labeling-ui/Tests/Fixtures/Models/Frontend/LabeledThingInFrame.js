import labeledThingCouchDbFixture from '../CouchDb/LabeledThing';

import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

export default new LabeledThingInFrame({
  "id": "d07235d9-92df-414d-a38a-694580ac7d6e",
  "rev": "1-asdfasdf123",
  "type": "AppBundle.Model.LabeledThingInFrame",
  "frameIndex": 0,
  "classes": [
    "ignore-vehicle"
  ],
  "shapes": [
    {
      "type": "rectangle",
      "id": "caf42507-197c-49e2-b949-d21734a3a646",
      "topLeft": {
        "x": 100,
        "y": 100
      },
      "bottomRight": {
        "x": 200,
        "y": 200
      },
      "labeledThingInFrameId": "d07235d9-92df-414d-a38a-694580ac7d6e"
    }
  ],
  "taskId": "5242f8bff15774fe72586e569a05ce0c",
  "projectId": "9a8d567033f93fcd8cf50c2535008766",
  "labeledThingId": "04d2f1b2-fa17-438d-abe3-7c1db43186a0",
  "labeledThing": labeledThingCouchDbFixture,
  "incomplete": false
});