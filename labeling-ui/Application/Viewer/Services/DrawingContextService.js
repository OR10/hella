import paper from 'paper';
import DrawingContext from '../DrawingContext';


/**
 * @class DrawingContextService
 */
export default class DrawingContextService {
  constructor() {
    /**
     * Reference to the currently active scope
     *
     * @type {paper.PaperScope}
     */
    this._activeScope = paper;
  }

  createContext() {
    return new DrawingContext(this._activeScope);
  }
}
