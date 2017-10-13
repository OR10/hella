import { inject } from 'angular-mocks';
import ShapeMergeService from 'Application/Common/Services/ShapeMergeService';

describe('ShapeMergeService', () => {
  /**
   * @type {ShapeMergeService}
   */
  let service;

  /**
   * @type {LabeledThingInFrameGateway}
   */
  let labeledThingInFrameGateway;

  /**
   * @type {$q}
   */
  let angularQ;

  /**
   * @type {$rootScope}
   */
  let rootScope;

  /**
   * @type {LabeledThingGateway}
   */
  let labeledThingGateway;

  let firstFrameRange;
  let secondFrameRange;
  let thirdFrameRange;
  let firstLabeledThing;
  let secondLabeledThing;
  let thirdLabeledThing;
  let firstLabeledThingInFrame;
  let secondLabeledThingInFrame;
  let thirdLabeledThingInFrame;
  let fourthLabeledThingInFrame;
  let firstShape;
  let secondShape;
  let thirdShape;
  let fourthShape;
  let firstObject;
  let secondObject;
  let thirdObject;
  let fourthObject;
  let mergableShapes;
  let modalService;
  let selectionDialog;
  let selectionDialogConfirmCallback;
  let selectionDialogAbortCallback;
  let extractClassList;

  beforeEach(inject(($rootScope, $q) => {
    rootScope = $rootScope;
    angularQ = $q;
  }));

  beforeEach(() => {
    labeledThingInFrameGateway = jasmine.createSpyObj('labeledThingInFrameGateway', ['saveLabeledThingInFrame']);
    labeledThingGateway = jasmine.createSpyObj('labeledThingGateway', ['deleteLabeledThing', 'hasAssociatedLabeledThingsInFrames', 'getAssociatedLabeledThingsInFrames']);

    modalService = jasmine.createSpyObj('modalService', ['show']);
    selectionDialog = (config, confirmCallback, abortCallback) => {
      selectionDialogConfirmCallback = confirmCallback;
      selectionDialogAbortCallback = abortCallback;
    };

    service = new ShapeMergeService(rootScope, angularQ, labeledThingInFrameGateway, labeledThingGateway, modalService, selectionDialog);
  });

  beforeEach(() => {
    extractClassList = jasmine.createSpy('LabeledObject.extractClassList()');
    // Do not use arrow function here, otherwise this would not be the current ltif
    extractClassList.and.callFake(function() {
      return this.classes;
    });

    firstFrameRange = {startFrameIndex: 0, endFrameIndex: 0};
    secondFrameRange = {startFrameIndex: 3, endFrameIndex: 3};
    thirdFrameRange = {startFrameIndex: 7, endFrameIndex: 7};

    firstLabeledThing = {ltid: 1, frameRange: firstFrameRange};
    secondLabeledThing = {ltid: 2, frameRange: secondFrameRange};
    thirdLabeledThing = {ltid: 3, frameRange: thirdFrameRange};

    firstLabeledThingInFrame = {litfid: 1, labeledThing: firstLabeledThing, frameIndex: 0, extractClassList: extractClassList};
    secondLabeledThingInFrame = {litfid: 2, labeledThing: secondLabeledThing, frameIndex: 1, extractClassList: extractClassList};
    thirdLabeledThingInFrame = {litfid: 3, labeledThing: thirdLabeledThing, frameIndex: 2, extractClassList: extractClassList};
    fourthLabeledThingInFrame = {litfid: 4, labeledThing: thirdLabeledThing, frameIndex: 3, fourthExtractClassList: extractClassList};

    firstShape = {id: '1', labeledThingInFrame: firstLabeledThingInFrame};
    secondShape = {id: '2', labeledThingInFrame: secondLabeledThingInFrame};
    thirdShape = {id: '3', labeledThingInFrame: thirdLabeledThingInFrame};
    fourthShape = {id: '4', labeledThingInFrame: fourthLabeledThingInFrame};

    firstObject = {shape: firstShape};
    secondObject = {shape: secondShape};
    thirdObject = {shape: thirdShape};
    fourthObject = {shape: fourthShape};

    mergableShapes = [firstObject, secondObject, thirdObject];
  });

  beforeEach(() => {
    labeledThingInFrameGateway.saveLabeledThingInFrame.and.returnValue(angularQ.resolve());
    labeledThingGateway.deleteLabeledThing.and.returnValue(angularQ.resolve());

    labeledThingGateway.getAssociatedLabeledThingsInFrames.and.callFake(labeledThing => {
      switch (labeledThing) {
        case firstLabeledThing:
          return angularQ.resolve([firstLabeledThingInFrame]);

        case secondLabeledThing:
          return angularQ.resolve([secondLabeledThingInFrame]);

        case thirdLabeledThing:
          return angularQ.resolve([thirdLabeledThingInFrame, fourthLabeledThingInFrame]);

        default:
          return [];
      }
    });
  });

  it('can be created', () => {
    expect(service).toEqual(jasmine.any(ShapeMergeService));
  });

  describe('mergeShapes', () => {
    it('sets the LabeledThing of the root shape on all elements', () => {
      service.mergeShapes(mergableShapes);
      selectionDialogConfirmCallback(firstShape.id);
      rootScope.$apply();

      expect(firstLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
      expect(secondLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
      expect(thirdLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
    });

    it('stores the ltifs', () => {
      service.mergeShapes(mergableShapes);
      selectionDialogConfirmCallback(firstShape.id);
      rootScope.$apply();

      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledTimes(3);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).not.toHaveBeenCalledWith(firstLabeledThingInFrame);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(secondLabeledThingInFrame);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(thirdLabeledThingInFrame);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(fourthLabeledThingInFrame);
    });

    it('returns a promise', done => {
      labeledThingGateway.hasAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(true));

      service.mergeShapes(mergableShapes).then(done);
      selectionDialogConfirmCallback(firstShape.id);
      rootScope.$apply();
    });

    it('transfers the classes', () => {
      const classes = ['one', 'two', 'three'];
      secondLabeledThingInFrame.classes = classes;
      const shapes = [secondObject, thirdObject, firstObject];

      service.mergeShapes(shapes);
      selectionDialogConfirmCallback(secondShape.id);
      rootScope.$apply();

      expect(firstLabeledThingInFrame.classes).toBe(classes);
      expect(secondLabeledThingInFrame.classes).toBe(classes);
      expect(thirdLabeledThingInFrame.classes).toBe(classes);
      expect(extractClassList).toHaveBeenCalledTimes(3);
    });

    it('transfers the incomplete state', () => {
      firstLabeledThingInFrame.incomplete = true;
      secondLabeledThingInFrame.incomplete = false;
      thirdLabeledThingInFrame.incomplete = false;

      service.mergeShapes(mergableShapes);
      selectionDialogConfirmCallback(firstShape.id);
      rootScope.$apply();

      expect(firstLabeledThingInFrame.incomplete).toBe(true);
      expect(secondLabeledThingInFrame.incomplete).toBe(true);
      expect(thirdLabeledThingInFrame.incomplete).toBe(true);
    });

    it('updates the frameRange of the LabeledThing', () => {
      service.mergeShapes(mergableShapes);
      selectionDialogConfirmCallback(firstShape.id);

      const expectedFrameRange = {startFrameIndex: 0, endFrameIndex: 7};
      expect(firstLabeledThing.frameRange).toEqual(expectedFrameRange);
    });

    it('emits shape:merge:after', done => {
      spyOn(rootScope, '$emit');

      labeledThingGateway.hasAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(true));

      service.mergeShapes(mergableShapes).then(() => {
        expect(rootScope.$emit).toHaveBeenCalledWith('shape:merge:after');
        done();
      });

      selectionDialogConfirmCallback(firstShape.id);
      rootScope.$apply();
    });

    it('moves all the ltifs to the root object and deletes the other lts only once', done => {
      labeledThingGateway.hasAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(false));

      // make sure LT3 is available two times for this test
      mergableShapes.push(fourthObject);

      service.mergeShapes(mergableShapes).then(() => {
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledTimes(2);
        expect(labeledThingGateway.deleteLabeledThing).not.toHaveBeenCalledWith(firstLabeledThing);
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledWith(secondLabeledThing);
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledWith(thirdLabeledThing);

        expect(firstLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(secondLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(thirdLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(fourthLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);

        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledTimes(3);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).not.toHaveBeenCalledWith(firstLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(secondLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(thirdLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(fourthLabeledThingInFrame);

        done();
      });

      selectionDialogConfirmCallback(firstShape.id);

      rootScope.$apply();
    });

    it('moves all the ltifs to the root object and deletes the other lts', done => {
      labeledThingGateway.hasAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(false));

      // fourthShape is not part of mergableShapes, but part of thirdLabeledThing and shoule be moved aswell
      service.mergeShapes(mergableShapes).then(() => {
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledTimes(2);
        expect(labeledThingGateway.deleteLabeledThing).not.toHaveBeenCalledWith(firstLabeledThing);
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledWith(secondLabeledThing);
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledWith(thirdLabeledThing);

        expect(firstLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(secondLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(thirdLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(fourthLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);

        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledTimes(3);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).not.toHaveBeenCalledWith(firstLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(secondLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(thirdLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(fourthLabeledThingInFrame);

        done();
      });

      selectionDialogConfirmCallback(firstShape.id);

      rootScope.$apply();
    });

    it('makes sure there are no two ltifs on the same frame, using root as the higher priority ltifs', () => {
      firstLabeledThingInFrame.frameIndex = 0;
      secondLabeledThingInFrame.frameIndex = 1;
      thirdLabeledThingInFrame.frameIndex = 0;
      fourthLabeledThingInFrame.frameIndex = 1;

      service.mergeShapes(mergableShapes);
      selectionDialogConfirmCallback(firstShape.id);
      rootScope.$apply();

      expect(firstLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
      expect(secondLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
      expect(thirdLabeledThingInFrame.labeledThing).toBe(thirdLabeledThing);
      expect(fourthLabeledThingInFrame.labeledThing).toBe(thirdLabeledThing);
    });

    it('can merge two shapes, if both only have shapes on the same frame', () => {
      const shapes = [secondObject, firstObject];

      service.mergeShapes(shapes);
      selectionDialogConfirmCallback(secondShape.id);
      rootScope.$apply();

      expect(secondLabeledThingInFrame.labeledThing).toBe(secondLabeledThing);
      expect(firstLabeledThingInFrame.labeledThing).toBe(secondLabeledThing);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledTimes(1);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(firstLabeledThingInFrame);
      expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledTimes(1);
      expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledWith(firstLabeledThing);
    });

    describe('Selection modal', () => {
      it('shows a selection modal before merging', () => {
        service.mergeShapes(mergableShapes);

        expect(modalService.show).toHaveBeenCalledTimes(1);
      });

      it('shows the selection modal once more if no root shape was selected', done => {
        service.mergeShapes(mergableShapes).then(() => {
          done.fail('This should not have happened');
        });

        selectionDialogConfirmCallback(undefined);

        expect(modalService.show).toHaveBeenCalledTimes(2);
        done();
      });

      it('rejects the merging', done => {
        service.mergeShapes(mergableShapes).catch(() => {
          expect(modalService.show).toHaveBeenCalledTimes(1);
          done();
        });

        selectionDialogAbortCallback();
        rootScope.$apply();
      });

      it('merges the shape with a different root shape', () => {
        service.mergeShapes(mergableShapes);
        selectionDialogConfirmCallback(secondShape.id);
        rootScope.$apply();

        expect(firstLabeledThingInFrame.labeledThing).toBe(secondLabeledThing);
        expect(secondLabeledThingInFrame.labeledThing).toBe(secondLabeledThing);
        expect(thirdLabeledThingInFrame.labeledThing).toBe(secondLabeledThing);
        expect(fourthLabeledThingInFrame.labeledThing).toBe(secondLabeledThing);

        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledTimes(2);
        expect(labeledThingGateway.deleteLabeledThing).not.toHaveBeenCalledWith(secondLabeledThing);
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledWith(firstLabeledThing);
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledWith(thirdLabeledThing);
      });
    });
  });
});
