import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Jump through attributes', () => {
  let assets;
  let toggleClassSearchButton;

  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
      `${__dirname}/../PouchDbDocuments`
    );
    bootstrapHttp([
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
      assets.mocks.CutShape.Rectangle.Task,
      assets.mocks.CutShape.Rectangle.TaskConfiguration,
      assets.mocks.CutShape.Rectangle.TaskConfigurationFile,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to3,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ]);

    toggleClassSearchButton = element(by.css('#toggle-class-search-button'));
  });

  it('should jump forward through the ltifs shapes', done => {
    bootstrapPouch([
      assets.documents.JumpToNextAttributeFilter.Rectangles.LabeledThingInFrame.frameIndex0to1,
    ]);

    const nextShapeButton = element(by.css('#select-next-shape-with-class'));

    initApplication(
      '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toggleClassSearchButton.click())
      .then(() => mediumSleep())
      .then(() => {
        const attributeChoiceSelector = element(by.id('choicesShapeSelection'));
        attributeChoiceSelector.$('[value="time-limit-start-0"]').click();
        return Promise.resolve();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('JumpToNextAttributeFilter', 'FirstForwardShape')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.JumpToNextAttributeFilter.FirstForwardShape);
      })
      .then(() => mediumSleep())
      .then(() => nextShapeButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('JumpToNextAttributeFilter', 'SecondForwardShape')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.JumpToNextAttributeFilter.SecondForwardShape);
      })
      .then(() => {
        done();
      });
  });

  it('should jump backwards through the ltifs shapes', done => {
    bootstrapPouch([
      assets.documents.JumpToNextAttributeFilter.Rectangles.LabeledThingInFrame.frameIndex0to1,
    ]);

    const previousShapeButton = element(by.css('#select-previous-shape-with-class'));

    initApplication(
      '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toggleClassSearchButton.click())
      .then(() => mediumSleep())
      .then(() => {
        const attributeChoiceSelector = element(by.id('choicesShapeSelection'));
        attributeChoiceSelector.$('[value="time-limit-start-0"]').click();
        return Promise.resolve();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('JumpToNextAttributeFilter', 'FirstBackwardShape')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.JumpToNextAttributeFilter.FirstBackwardShape);
      })
      .then(() => mediumSleep())
      .then(() => previousShapeButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('JumpToNextAttributeFilter', 'SecondBackwardShape')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.JumpToNextAttributeFilter.SecondBackwardShape);
      })
      .then(() => {
        done();
      });
  });

  it('should jump forward through the ltg shapes', done => {
    bootstrapPouch([
      assets.documents.JumpToNextAttributeFilter.Rectangles.LabeledThingInFrame.frameIndex0to1,
    ]);

    const nextShapeButton = element(by.css('#select-next-shape-with-class'));

    initApplication(
      '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toggleClassSearchButton.click())
      .then(() => mediumSleep())
      .then(() => {
        const attributeChoiceSelector = element(by.id('choicesShapeSelection'));
        attributeChoiceSelector.$('[value="position-below"]').click();
        return Promise.resolve();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('JumpToNextAttributeFilter', 'FirstForwardGroupShape')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.JumpToNextAttributeFilter.FirstForwardGroupShape);
      })
      .then(() => mediumSleep())
      .then(() => nextShapeButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('JumpToNextAttributeFilter', 'SecondForwardGroupShape')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.JumpToNextAttributeFilter.SecondForwardGroupShape);
      })
      .then(() => {
        done();
      });
  });

  it('should jump backwards through the ltg shapes', done => {
    bootstrapPouch([
      assets.documents.JumpToNextAttributeFilter.Rectangles.LabeledThingInFrame.frameIndex0to1,
    ]);

    const previousShapeButton = element(by.css('#select-previous-shape-with-class'));

    initApplication(
      '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toggleClassSearchButton.click())
      .then(() => mediumSleep())
      .then(() => {
        const attributeChoiceSelector = element(by.id('choicesShapeSelection'));
        attributeChoiceSelector.$('[value="position-below"]').click();
        return Promise.resolve();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('JumpToNextAttributeFilter', 'FirstBackwardGroupShape')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.JumpToNextAttributeFilter.FirstBackwardGroupShape);
      })
      .then(() => mediumSleep())
      .then(() => previousShapeButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('JumpToNextAttributeFilter', 'SecondBackwardGroupShape')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.JumpToNextAttributeFilter.SecondBackwardGroupShape);
      })
      .then(() => {
        done();
      });
  });
});
