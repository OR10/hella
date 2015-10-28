import EventEmitter from 'event-emitter';

/**
 * Layer handling event delegation to other {@link Layer}s of the {@link Viewer}
 */
export default class EventDelegationLayer extends EventEmitter {
  constructor() {
    super();
    this._onDelegateEvent = this._onDelegateEvent.bind(this);
  }

  /**
   * Attach this EventDelagationLayer to a specific DOM container.
   *
   * All delegated events will be automatically registered on the container.
   *
   * @param {Element} element
   */
  attachToDom(element) {
    [
      'mousedown',
      'mouseup',
      'mousemove',
      'mouseenter',
      'mouseleave',
      'mouseover',
      'click',
      'dblclick',
    ].forEach(
      name => element.addEventListener(name, this._onDelegateEvent)
    );
  }

  /**
   * Dispatch the given Event to the given {@link Layer}
   *
   * The Event will be cloned according to its structure in order to be dispatchable again.
   *
   * @param {Event} event
   * @param {Layer} layer
   */
  dispatch(event, layer) {
    const clonedEvent = this._cloneEvent(event);
    layer.dispatchDOMEvent(clonedEvent);
  }

  /**
   * Clone the given Event structure to create a new dispatchable event
   *
   * @param {Event} event
   * @returns {Event}
   * @private
   */
  _cloneEvent(event) {
    switch (true) {
      case event instanceof MouseEvent:
        return this._cloneMouseEvent(event);
      default:
        throw new Error(`Event cloning of type ${event.type} is not supported.`);
    }
  }

  /**
   * Correctly clone MouseEvents
   *
   * @param {MouseEvent} event
   *
   * @returns {MouseEvent}
   * @private
   */
  _cloneMouseEvent(event) {
    return new MouseEvent(event.type, {
      bubbles: event.bubbles,
      cancelable: event.cancelable,
      detail: event.detail,
      view: event.view,
      screenX: event.screenX,
      screenY: event.screenY,
      clientX: event.clientX,
      clientY: event.clientY,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      button: event.button,
      buttons: event.buttons,
      relatedTarget: event.relatedTarget,
      region: event.region,
    });
  }

  /**
   * Handle all kinds of different incoming events and delegate them for possible dispatch.
   *
   * @param {Event} event
   * @private
   */
  _onDelegateEvent(event) {
    this.emit('event:new', this, event);
  }
}
