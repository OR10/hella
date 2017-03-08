import {inject} from 'angular-mocks';
import angular from 'angular';
import ThingLayer from 'Application/Viewer/Layers/ThingLayer';
import PanAndZoomPaperLayer from 'Application/Viewer/Layers/PanAndZoomPaperLayer';
import ToolAbortedError from 'Application/Viewer/Tools/Errors/ToolAbortedError';
import PaperThingShape from 'Application/Viewer/Shapes/PaperThingShape';
import PaperGroupShape from 'Application/Viewer/Shapes/PaperGroupShape';
import paper from 'paper';

fdescribe('ThingLayer test suite', () => {
  let injector;
  let scope;
  let drawingContext;
  let task;

  // Service mocks
  let loggerService;
  let toolService;
  let viewerMouseCursorService;
  let timeoutService;

  beforeEach(module($provide => {
    // Service mocks
    loggerService = jasmine.createSpyObj('$logger', ['groupStart', 'log', 'groupEnd', 'groupStartOpened']);
    $provide.service('loggerService', () => loggerService);

    toolService = jasmine.createSpyObj('toolService', ['getTool']);
    $provide.service('toolService', () => toolService);

    viewerMouseCursorService = jasmine.createSpyObj('viewerMouseCursorService', ['setMouseCursor']);
    $provide.service('viewerMouseCursorService', () => viewerMouseCursorService);

    drawingContext = jasmine.createSpyObj('drawingContext', ['withScope', 'setup']);
    drawingContext.withScope.and.callFake(callback => callback(scope));

    timeoutService = jasmine.createSpy('$timeout');
  }));

  beforeEach(inject(($injector, $rootScope) => {
    injector = $injector;

    task = {
      minimalVisibleShapeOverflow: null,
    };

    scope = $rootScope.$new();
    scope.view = jasmine.createSpyObj('scope.view', ['update']);
    scope.vm = { task: task };
  }));

  function createThingLayerInstance() {
    const framePosition = jasmine.createSpyObj('framePosition', ['beforeFrameChangeAlways', 'afterFrameChangeAlways']);

    return new ThingLayer(0, 0, scope, injector, drawingContext, toolService, null, loggerService, timeoutService, framePosition, viewerMouseCursorService);
  }

  function setupPaperJs() {
    const canvas = document.createElement('canvas');
    paper.setup(canvas);
  }

  describe('Creation', () => {
    it('is a PanAndZoomPaperLayer', () => {
      const thing = createThingLayerInstance();
      expect(thing).toEqual(jasmine.any(PanAndZoomPaperLayer));
    });

    describe('Collection watchers', () => {
      beforeEach(() => {
        spyOn(scope, '$watchCollection');
      });

      it('watches the vm.paperGroupShapes collection', () => {
        createThingLayerInstance();
        expect(scope.$watchCollection).toHaveBeenCalledWith('vm.paperGroupShapes', jasmine.any(Function));
      });

      it('watches the vm.paperGroupShapes collection', () => {
        createThingLayerInstance();
        expect(scope.$watchCollection).toHaveBeenCalledWith('vm.paperThingShapes', jasmine.any(Function));
      });
    });

    describe('Normal watchers', () => {
      beforeEach(() => {
        spyOn(scope, '$watch');
      });

      it('watches vm.hideLabeledThingsInFrame', () => {
        createThingLayerInstance();
        expect(scope.$watch).toHaveBeenCalledWith('vm.hideLabeledThingsInFrame', jasmine.any(Function));
      });

      it('watches vm.selectedPaperShape', () => {
        createThingLayerInstance();
        expect(scope.$watch).toHaveBeenCalledWith('vm.selectedPaperShape', jasmine.any(Function));
      });
    });
  });

  it('updates the view when leaving the canvas', () => {
    const keyboardTool = jasmine.createSpyObj('keyboardTool', ['invokeKeyboardShortcuts', 'abort']);
    toolService.getTool.and.returnValue(keyboardTool);
    const keyboardPromise = jasmine.createSpyObj('keyboardPromise', ['then']);
    keyboardTool.invokeKeyboardShortcuts.and.returnValue(keyboardPromise);

    const thing = createThingLayerInstance();
    const event = {type: 'mouseenter'};
    thing.activateTool('multi', {});

    const promiseMock = jasmine.createSpyObj('activeTool.invoke promise mock', ['then', 'catch']);
    promiseMock.then.and.returnValue(promiseMock);
    promiseMock.catch.and.callFake(callback => {
      const reason = new ToolAbortedError();
      callback(reason);
    });
    spyOn(thing._activeTool, 'invoke').and.returnValue(promiseMock);

    thing.dispatchDOMEvent(event);

    expect(scope.view.update).toHaveBeenCalled();
  });

  xdescribe('vm.paperGroupShapes watcher', () => {
  });

  xdescribe('vm.paperThingShapes watcher', () => {
  });

  xdescribe('vm.hideLabeledThingsInFrame watcher', () => {
  });

  xdescribe('vm.selectedPaperShape watcher', () => {
  });

  xdescribe('#dispatchDOMEvent', () => {
  });

  describe('#activateTool()', () => {
    let thing;

    beforeEach(() => {
      thing = createThingLayerInstance();
    });

    it('throws an error if the tool is unknown', () => {
      function throwWrapper() {
        thing.activateTool('bernddasbrot');
      }

      expect(throwWrapper).toThrowError('Unknown tool with name: bernddasbrot');
    });

    it('aborts the active tool', () => {
      const activeTool = jasmine.createSpyObj('activateTool', ['abort']);
      thing._activeTool = activeTool;

      thing.activateTool('zoomIn');

      expect(activeTool.abort).toHaveBeenCalled();
    });

    it('sets scope.tool to null', () => {
      expect(scope.tool).toBeUndefined();
      thing.activateTool('zoomIn');
      expect(scope.tool).toBeNull();
    });

    it('resets possible mouse cursor left-overs', () => {
      thing.activateTool('zoomIn');
      expect(viewerMouseCursorService.setMouseCursor).toHaveBeenCalledWith(null);
    });

    describe('ZoomInTool', () => {
      it('calls abort on the ZoomInTool', () => {
        spyOn(thing._zoomInTool, 'abort');

        thing.activateTool('zoomIn');

        expect(thing._zoomInTool.abort).toHaveBeenCalled();
      });

      it('calls invoke on the ZoomInTool', () => {
        spyOn(thing._zoomInTool, 'invoke').and.callThrough();

        thing.activateTool('zoomIn');

        expect(thing._zoomInTool.invoke).toHaveBeenCalled();
      });
    });

    describe('ZoomOutTool', () => {
      it('calls abort on the ZoomOutTool', () => {
        spyOn(thing._zoomOutTool, 'abort');

        thing.activateTool('zoomOut');

        expect(thing._zoomOutTool.abort).toHaveBeenCalled();
      });

      it('calls invoke on the ZoomOutTool', () => {
        spyOn(thing._zoomOutTool, 'invoke').and.callThrough();

        thing.activateTool('zoomOut');

        expect(thing._zoomOutTool.invoke).toHaveBeenCalled();
      });
    });

    describe('MultiTool', () => {
      let selectedLabelStructureThing;

      beforeEach(() => {
        selectedLabelStructureThing = {
          id: 'foobar',
          shape: 'heinz',
        };

        const keyboardTool = jasmine.createSpyObj('keyboardTool', ['invokeKeyboardShortcuts', 'abort']);
        keyboardTool.invokeKeyboardShortcuts.and.returnValue({then: () => {}});
        toolService.getTool.and.returnValue(keyboardTool);
      });

      it('calls abort on the MultiTool', () => {
        spyOn(thing._multiTool, 'abort');

        thing.activateTool('multi', selectedLabelStructureThing);

        expect(thing._multiTool.abort).toHaveBeenCalled();
      });

      it('calls invoke on the MultiTool', () => {
        spyOn(thing._multiTool, 'invoke').and.callThrough();

        thing.activateTool('multi', selectedLabelStructureThing);

        expect(thing._multiTool.invoke).toHaveBeenCalled();
      });

      it('does not call invoke on the MultiTool if selectedLabelStructureThing is null', () => {
        spyOn(thing._multiTool, 'invoke').and.callThrough();

        thing.activateTool('multi', null);

        expect(thing._multiTool.invoke).not.toHaveBeenCalled();
      });

      describe('actionIdentifier "creation"', () => {
        const actionIdentifier = 'creation';
        const bogusPaperShape = 'Bernd das Brot';
        let invokePromiseMock;
        let invokeThenParams;

        beforeEach(() => {
          setupPaperJs();

          invokeThenParams = {
            actionIdentifier: actionIdentifier,
            paperShape: bogusPaperShape,
          };
          invokePromiseMock = jasmine.createSpyObj('invoke promise return', ['then']);
          invokePromiseMock.then.and.callFake(then => {
            then(invokeThenParams);
            return { catch: () => {} };
          });
          spyOn(thing._multiTool, 'invoke').and.returnValue(invokePromiseMock);
        });

        describe('Created PaperThingShape', () => {
          let paperThingShape;

          beforeEach(() => {
            paperThingShape = new PaperThingShape();
            invokeThenParams.paperShape = paperThingShape;

            scope.vm.paperThingShapes = [];
          });

          it('emits thing:create when the Shape is a PaperThingShape', () => {
            spyOn(thing, 'emit');

            thing.activateTool('multi', selectedLabelStructureThing);

            expect(thing.emit).toHaveBeenCalledWith('thing:create', paperThingShape);
          });

          it('adds the shape to the paperThingShapes array', () => {
            thing.activateTool('multi', selectedLabelStructureThing);

            expect(scope.vm.paperThingShapes).toEqual([paperThingShape]);
          });

          it('sets the shape as selected shape', () => {
            thing.activateTool('multi', selectedLabelStructureThing);

            expect(scope.vm.selectedPaperShape).toBe(paperThingShape);
          });
        });

        describe('Created PaperGroupShape', () => {
          let paperGroupShape;

          beforeEach(() => {
            paperGroupShape = new PaperGroupShape();
            invokeThenParams.paperShape = paperGroupShape;

            scope.vm.paperGroupShapes = [];
          });

          it('emits group:create when the Shape is a PaperThingShape', () => {
            spyOn(thing, 'emit');

            thing.activateTool('multi', selectedLabelStructureThing);

            expect(thing.emit).toHaveBeenCalledWith('group:create', paperGroupShape);
          });

          it('adds the shape to the paperGroupShapes array', () => {
            thing.activateTool('multi', selectedLabelStructureThing);

            expect(scope.vm.paperGroupShapes).toEqual([paperGroupShape]);
          });

          it('sets the shape as selected shape', () => {
            thing.activateTool('multi', selectedLabelStructureThing);

            expect(scope.vm.selectedPaperShape).toBe(paperGroupShape);
          });
        });

        it('it throws an error if it cannot handle the shape creation', () => {
          function throwWrapper() {
            thing.activateTool('multi', selectedLabelStructureThing);
          }

          expect(throwWrapper).toThrowError(`Can not handle shape creation of type: ${bogusPaperShape}`);
        });
      });

      describe('actionIdentifier "selection"', () => {
        let paperShape;
        let invokePromiseMock;

        beforeEach(() => {
          paperShape = {Bernd: 'das Brot'};

          invokePromiseMock = jasmine.createSpyObj('invoke promise return', ['then']);
          invokePromiseMock.then.and.callFake(callback => {
            const callbackParams = {
              actionIdentifier: 'selection',
              paperShape: paperShape,
            };
            callback(callbackParams);
            return { catch: () => {} };
          });

          spyOn(thing._multiTool, 'invoke').and.returnValue(invokePromiseMock);
        });

        it('it sets the paperShape as selectedPaperShape', () => {
          thing.activateTool('multi', selectedLabelStructureThing);

          expect(scope.vm.selectedPaperShape).toBe(paperShape);
        });

        it('runs a timeout for angular $digest reasons', () => {
          thing.activateTool('multi', selectedLabelStructureThing);

          expect(timeoutService).toHaveBeenCalled();
        });
      });

      describe('actionIdentifier "$something"', () => {
        it('it throws an error if it cannot handle the shape update', () => {
          const paperShape = 'Bernd das Brot';

          const invokePromiseMock = jasmine.createSpyObj('invoke promise return', ['then']);
          invokePromiseMock.then.and.callFake(callback => {
            const callbackParams = {
              actionIdentifier: 'something-unknown',
              paperShape: paperShape,
            };
            callback(callbackParams);
            return { catch: () => {} };
          });

          spyOn(thing._multiTool, 'invoke').and.returnValue(invokePromiseMock);

          function throwWrapper() {
            thing.activateTool('multi', selectedLabelStructureThing);
          }

          expect(throwWrapper).toThrowError(`Can not handle shape update of type: ${paperShape}`);
        });
      });
    });
  });

  describe('#addPaperThingShapes()', () => {
    let thing;
    let paperShapes;
    let firstPaperShape;
    let secondPaperShape;
    let thirdPaperShape;

    beforeEach(() => {
      firstPaperShape = {id: 1};
      secondPaperShape = {id: 2};
      thirdPaperShape = {id: 3};
      paperShapes = [firstPaperShape, secondPaperShape, thirdPaperShape];

      thing = createThingLayerInstance();
      spyOn(thing, 'addPaperThingShape');
    });

    it('calls addPaperThingShape for every shape, updating the view', () => {
      const updateView = true;

      thing.addPaperThingShapes(paperShapes, updateView);

      expect(thing.addPaperThingShape).toHaveBeenCalledTimes(3);
      expect(thing.addPaperThingShape).toHaveBeenCalledWith(firstPaperShape, false);
      expect(thing.addPaperThingShape).toHaveBeenCalledWith(secondPaperShape, false);
      expect(thing.addPaperThingShape).toHaveBeenCalledWith(thirdPaperShape, false);
      expect(scope.view.update).toHaveBeenCalledTimes(1);
    });

    it('calls addPaperThingShape for every shape, not updating the view', () => {
      const updateView = false;

      thing.addPaperThingShapes(paperShapes, updateView);

      expect(thing.addPaperThingShape).toHaveBeenCalledTimes(3);
      expect(thing.addPaperThingShape).toHaveBeenCalledWith(firstPaperShape, false);
      expect(thing.addPaperThingShape).toHaveBeenCalledWith(secondPaperShape, false);
      expect(thing.addPaperThingShape).toHaveBeenCalledWith(thirdPaperShape, false);
      expect(scope.view.update).not.toHaveBeenCalled();
    });
  });

  describe('#addPaperGroupShapes()', () => {
    let thing;
    let groupShapes;
    let firstGroupShape;
    let secondGroupShape;
    let thirdGroupShape;

    beforeEach(() => {
      firstGroupShape = {id: 1};
      secondGroupShape = {id: 2};
      thirdGroupShape = {id: 3};
      groupShapes = [firstGroupShape, secondGroupShape, thirdGroupShape];

      thing = createThingLayerInstance();
      spyOn(thing, 'addPaperGroupShape');
    });

    it('calls addPaperGroupShape for every shape, updating the view', () => {
      const updateView = true;

      thing.addPaperGroupShapes(groupShapes, updateView);

      expect(thing.addPaperGroupShape).toHaveBeenCalledTimes(3);
      expect(thing.addPaperGroupShape).toHaveBeenCalledWith(firstGroupShape, false);
      expect(thing.addPaperGroupShape).toHaveBeenCalledWith(secondGroupShape, false);
      expect(thing.addPaperGroupShape).toHaveBeenCalledWith(thirdGroupShape, false);
      expect(scope.view.update).toHaveBeenCalledTimes(1);
    });

    it('calls addPaperGroupShape for every shape, not updating the view', () => {
      const updateView = false;

      thing.addPaperGroupShapes(groupShapes, updateView);

      expect(thing.addPaperGroupShape).toHaveBeenCalledTimes(3);
      expect(thing.addPaperGroupShape).toHaveBeenCalledWith(firstGroupShape, false);
      expect(thing.addPaperGroupShape).toHaveBeenCalledWith(secondGroupShape, false);
      expect(thing.addPaperGroupShape).toHaveBeenCalledWith(thirdGroupShape, false);
      expect(scope.view.update).not.toHaveBeenCalled();
    });
  });

  describe('#addPaperThingShape', () => {
    let thing;

    beforeEach(() => {
      thing = createThingLayerInstance();
    });

    it('updates the view', () => {
      const paperShape = {};

      thing.addPaperThingShape(paperShape);

      expect(scope.view.update).toHaveBeenCalled();
    });

    it('does not update the view', () => {
      const paperShape = {};
      const updateView = false;

      thing.addPaperThingShape(paperShape, updateView);

      expect(scope.view.update).not.toHaveBeenCalled();
    });

    describe('do not set the shape as selected shape', () => {
      let paperShape;

      beforeEach(() => {
        paperShape = {};
      });

      it('does not update the view', () => {
        const updateView = false;

        thing.addPaperThingShape(paperShape, updateView);

        expect(scope.vm.selectedPaperShape).toBeUndefined();
        expect(scope.view.update).not.toHaveBeenCalled();
      });

      it('updates the view', () => {
        const updateView = true;

        thing.addPaperThingShape(paperShape, updateView);

        expect(scope.vm.selectedPaperShape).toBeUndefined();
        expect(scope.view.update).toHaveBeenCalled();
      });
    });

    describe('set the shape as selected shape', () => {
      const isSelected = true;
      let paperShape;

      beforeEach(() => {
        paperShape = {};
      });

      it('does not update the view', () => {
        const updateView = false;

        thing.addPaperThingShape(paperShape, updateView, isSelected);

        expect(scope.vm.selectedPaperShape).toBe(paperShape);
        expect(scope.view.update).not.toHaveBeenCalled();
      });

      it('updates the view', () => {
        const updateView = true;

        thing.addPaperThingShape(paperShape, updateView, isSelected);

        expect(scope.vm.selectedPaperShape).toBe(paperShape);
        expect(scope.view.update).toHaveBeenCalled();
      });
    });

    describe('Transport selection between frame changes', () => {
      let previousPaperShape;
      let currentPaperShape;

      beforeEach(() => {
        previousPaperShape = {
          labeledThingInFrame: {
            labeledThing: {
              id: 'foo',
            },
          },
        };
        currentPaperShape = {
          labeledThingInFrame: {
            labeledThing: {
              id: 'foo',
            },
          },
        };

        scope.vm.selectedPaperShape = previousPaperShape;
      });

      describe('set the shape as selected shape, if this shape was selected in a previous frame', () => {
        it('updates the view', () => {
          const updateView = true;

          thing.addPaperThingShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(currentPaperShape);
          expect(scope.view.update).toHaveBeenCalled();
        });

        it('does not update the view', () => {
          const updateView = false;

          thing.addPaperThingShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(currentPaperShape);
          expect(scope.view.update).not.toHaveBeenCalled();
        });
      });

      describe('keeps the shape as selected shape, if it is the same shape', () => {
        beforeEach(() => {
          scope.vm.selectedPaperShape = currentPaperShape;
        });

        it('updates the view', () => {
          const updateView = true;

          thing.addPaperThingShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(currentPaperShape);
          expect(scope.view.update).toHaveBeenCalled();
        });

        it('does not update the view', () => {
          const updateView = false;

          thing.addPaperThingShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(currentPaperShape);
          expect(scope.view.update).not.toHaveBeenCalled();
        });
      });

      describe('keeps the previus as selected shape, if the id\'s don\'t match', () => {
        beforeEach(() => {
          currentPaperShape.labeledThingInFrame.labeledThing.id = 'bernddasbrot';
        });

        it('updates the view', () => {
          const updateView = true;

          thing.addPaperThingShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(previousPaperShape);
          expect(scope.view.update).toHaveBeenCalled();
        });

        it('does not update the view', () => {
          const updateView = false;

          thing.addPaperThingShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(previousPaperShape);
          expect(scope.view.update).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('#addPaperGroupShape()', () => {
    let thing;

    beforeEach(() => {
      thing = createThingLayerInstance();
    });

    it('updates the view', () => {
      const groupShape = {};

      thing.addPaperGroupShape(groupShape);

      expect(scope.view.update).toHaveBeenCalled();
    });

    it('does not update the view', () => {
      const groupShape = {};
      const updateView = false;

      thing.addPaperGroupShape(groupShape, updateView);

      expect(scope.view.update).not.toHaveBeenCalled();
    });

    describe('do not set the shape as selected shape', () => {
      let groupShape;

      beforeEach(() => {
        groupShape = {};
      });

      it('does not update the view', () => {
        const updateView = false;

        thing.addPaperGroupShape(groupShape, updateView);

        expect(scope.vm.selectedPaperShape).toBeUndefined();
        expect(scope.view.update).not.toHaveBeenCalled();
      });

      it('updates the view', () => {
        const updateView = true;

        thing.addPaperGroupShape(groupShape, updateView);

        expect(scope.vm.selectedPaperShape).toBeUndefined();
        expect(scope.view.update).toHaveBeenCalled();
      });
    });

    describe('set the shape as selected shape', () => {
      const isSelected = true;
      let groupShape;

      beforeEach(() => {
        groupShape = {};
      });

      it('does not update the view', () => {
        const updateView = false;

        thing.addPaperGroupShape(groupShape, updateView, isSelected);

        expect(scope.vm.selectedPaperShape).toBe(groupShape);
        expect(scope.view.update).not.toHaveBeenCalled();
      });

      it('updates the view', () => {
        const updateView = true;

        thing.addPaperGroupShape(groupShape, updateView, isSelected);

        expect(scope.vm.selectedPaperShape).toBe(groupShape);
        expect(scope.view.update).toHaveBeenCalled();
      });
    });

    describe('Transport selection between frame changes', () => {
      let previousPaperShape;
      let currentPaperShape;

      beforeEach(() => {
        previousPaperShape = {
          labeledThingGroupInFrame: {
            labeledThingGroup: {
              id: 'foo',
            },
          },
        };
        currentPaperShape = {
          labeledThingGroupInFrame: {
            labeledThingGroup: {
              id: 'foo',
            },
          },
        };

        scope.vm.selectedPaperShape = previousPaperShape;
      });

      describe('set the shape as selected shape, if this shape was selected in a previous frame', () => {
        it('updates the view', () => {
          const updateView = true;

          thing.addPaperGroupShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(currentPaperShape);
          expect(scope.view.update).toHaveBeenCalled();
        });

        it('does not update the view', () => {
          const updateView = false;

          thing.addPaperGroupShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(currentPaperShape);
          expect(scope.view.update).not.toHaveBeenCalled();
        });
      });

      describe('keeps the shape as selected shape, if it is the same shape', () => {
        beforeEach(() => {
          scope.vm.selectedPaperShape = currentPaperShape;
        });

        it('updates the view', () => {
          const updateView = true;

          thing.addPaperGroupShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(currentPaperShape);
          expect(scope.view.update).toHaveBeenCalled();
        });

        it('does not update the view', () => {
          const updateView = false;

          thing.addPaperGroupShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(currentPaperShape);
          expect(scope.view.update).not.toHaveBeenCalled();
        });
      });

      describe('keeps the previus as selected shape, if the id\'s don\'t match', () => {
        beforeEach(() => {
          currentPaperShape.labeledThingGroupInFrame.labeledThingGroup.id = 'bernddasbrot';
        });

        it('updates the view', () => {
          const updateView = true;

          thing.addPaperGroupShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(previousPaperShape);
          expect(scope.view.update).toHaveBeenCalled();
        });

        it('does not update the view', () => {
          const updateView = false;

          thing.addPaperGroupShape(currentPaperShape, updateView);

          expect(scope.vm.selectedPaperShape).toBe(previousPaperShape);
          expect(scope.view.update).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('#update', () => {
    it('updates the view', () => {
      const thingLayer = createThingLayerInstance();
      thingLayer.update();
      expect(scope.view.update).toHaveBeenCalled();
    });
  });

  xdescribe('#removePaperShapes()', () => {
  });

  describe('#attachToDom()', () => {
    let element;
    let angularElement;

    beforeEach(() => {
      element = '<p></p>';

      scope.project = {
        activeLayer: {},
      };

      scope.settings = {};

      scope.Color = jasmine.createSpy('scope.Color');

      spyOn(angular, 'element').and.callFake(() => {
        angularElement = jasmine.createSpyObj('angular.element', ['on']);
        return angularElement;
      });
    });

    afterEach(() => {
      // For some reason, the spy needs to explicitly call through after the test cases
      // see http://stackoverflow.com/a/31257947/2410151
      angular.element.and.callThrough();
    });

    it('adds a mousedown event handler', () => {
      const thingLayer = createThingLayerInstance();
      thingLayer.attachToDom(element);

      expect(angularElement.on).toHaveBeenCalledWith('mousedown', jasmine.any(Function));
    });

    it('adds a mouseup event handler', () => {
      const thingLayer = createThingLayerInstance();
      thingLayer.attachToDom(element);

      expect(angularElement.on).toHaveBeenCalledWith('mouseup', jasmine.any(Function));
    });

    it('makes the selection color transparent', () => {
      const selectedColor = {some: 'color'};
      scope.Color.and.returnValue(selectedColor);

      const thingLayer = createThingLayerInstance();
      thingLayer.attachToDom(element);

      expect(scope.project.activeLayer.selectedColor).toBe(selectedColor);
      expect(scope.settings.handleSize).toEqual(8);
    });
  });
});
