import paper from 'paper';
import DrawingContextService from 'Application/Viewer/Services/DrawingContextService';
import DrawingContext from 'Application/Viewer/Services/DrawingContext';
import {inject} from 'angular-mocks';

describe('DrawingContextService', () => {
  /**
   * @type {DrawingContextService}
   */
  let service;

  beforeEach(() => {
    inject($injector => {
      service = $injector.instantiate(DrawingContextService);
    });
  });

  it('should create new DrawingContexts upon request', () => {
    expect(service.createContext() instanceof DrawingContext).toBeTruthy();
  });

  // @TODO: No idea how to properly test this thing, as paper is kind of fucked up here
  //        Needs further investigation

  xit('should not change contexts once a new one is created', () => {
    const context = service.createContext();
    expect(paper).not.toBe(context.scope);
  });

  xit('should activate the scope of the given DrawingContext', () => {
    const context = service.createContext();
    expect(paper).not.toBe(context.scope);
    service.activateContext(context);
    expect(paper).toBe(context.scope);
  });
});
