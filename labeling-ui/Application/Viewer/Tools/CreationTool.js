import PaperTool from './PaperTool';

class CreationTool extends PaperTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$rootScope.Scope} $rootScope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {HierarchyCreationService} hierarchyCreationService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, hierarchyCreationService) {
    super(drawingContext, $rootScope, $q, loggerService);

    /**
     * @type {HierarchyCreationService}
     * @protected
     */
    this._hierarchyCreationService = hierarchyCreationService;
  }

  /**
   * Invoke the tool to start its workflow.
   * The returning promise is resolved after the
   * tool workflow is finished.
   *
   * @param {CreationToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeCreation(toolActionStruct) {
    return this._invoke(toolActionStruct);
  }

  /**
   * Create a default shape for this `CreationTool`.
   *
   * Usually the operation will be pseudo synchronous by directly calling {@link Tool#_complete} in its implementation.
   * However it may be asynchronous if needed.
   *
   * @param {CreationToolActionStruct} toolActionStruct
   */
  invokeDefaultShapeCreation(toolActionStruct) {
    return this._invoke(toolActionStruct);
  }

  /**
   * By default all the Tools support default creation (the + Button in the Media Bar)
   *
   * @returns {boolean}
   */
  get supportsDefaultCreation() {
    return true;
  }
}

CreationTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default CreationTool;
