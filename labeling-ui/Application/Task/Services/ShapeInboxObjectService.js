import {clone} from 'lodash';

class ShapeInboxObjectService {
  /**
   * @param {angular.$q} $q
   * @param {LabelStructureService} labelStructureService
   */
  constructor($q, labelStructureService) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {LabelStructureService}
     * @private
     */
    this._labelStructureService = labelStructureService;

    /**
     * @type {Map.<PaperShape, {shape: PaperThingShape, label: String, labelStructureObject: LabelStructureObject}>}
     * @private
     */
    this._objectStorage = new WeakMap();

    /**
     * To protect against race conditions creating different informations for the same shape
     * during generation a "lock" promise will be stored here.
     *
     * @type {WeakMap}
     * @private
     */
    this._generationMutex = new WeakMap();

    /**
     * @type {number}
     * @private
     */
    this._uniqueIdCounter = 1;
  }

  /**
   * @param {PaperShape} shape
   * @returns {Promise.<{shape: PaperThingShape, label: String, labelStructureObject: LabelStructureObject}>}
   */
  getInboxObject(shape) {
    let promise = this._$q.resolve();

    if (!this._objectStorage.has(shape)) {
      const mutexPromise = this._generationMutex.get(shape);
      if (mutexPromise !== undefined) {
        return mutexPromise;
      }

      const mutexPromiseDeferred = this._$q.defer();
      this._generationMutex.set(shape, mutexPromiseDeferred.promise);

      promise = promise
        .then(() => this._generateShapeInformationObject(shape))
        .then(informationObject => {
          this._objectStorage.set(shape, informationObject);
          mutexPromiseDeferred.resolve(informationObject);
          this._generationMutex.delete(shape);
        });
    }

    promise = promise.then(() => this._objectStorage.get(shape));
    return promise;
  }

  /**
   * @param {PaperShape} shape
   * @param {string} newName
   * @returns {Promise.<{shape: PaperThingShape, label: String, labelStructureObject: LabelStructureObject}>}
   */
  renameShape(shape, newName) {
    return this._$q.resolve()
      .then(() => this.getInboxObject(shape))
      .then(informationObject => {
        const newInformationObject = clone(informationObject);
        newInformationObject.label = newName;
        this._objectStorage.set(shape, newInformationObject);
        return newInformationObject;
      });
  }

  /**
   * @param {PaperShape} shape
   * @returns {Promise.<{shape: PaperThingShape, label: String, labelStructureObject: LabelStructureObject}>}
   * @private
   */
  _generateShapeInformationObject(shape) {
    const {labeledThingInFrame} = shape;
    const {task} = labeledThingInFrame;

    return this._$q.resolve()
      .then(() => this._labelStructureService.getLabelStructure(task))
      .then(structure => structure.getThingById(labeledThingInFrame.identifierName))
      .then(labelStructureObject => {
        return {
          shape,
          labelStructureObject,
          label: this._generateName(labelStructureObject),
        };
      });
  }

  /**
   * Generate and return a new unique name for the given shape
   *
   * @param {LabelStructureObject} lso
   * @returns {string}
   *
   * @private
   */
  _generateName(lso) {
    const name = `${lso.name} #${this._uniqueIdCounter++}`;
    console.log('generated name', name);
    return name;
  }
}

ShapeInboxObjectService.$inject = [
  '$q',
  'labelStructureService',
];

export default ShapeInboxObjectService;
