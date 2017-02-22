/**
 * This service provides access to browser interactions, which are not part of WebDriver
 */
class InteractionService {
  mouseWheelAt(cssSelector, x, y, deltaX, deltaY) {
    const elem = element(by.css(cssSelector));
    browser.actions()
      .mouseMove(elem, {x, y})
      .perform();

    return browser.executeScript((cssSelector, x, y, deltaX, deltaY) => { // eslint-disable-line no-shadow
      var elem = document.querySelectorAll(cssSelector)[0]; // eslint-disable-line no-var,no-shadow

      function getPosition(element) {
        var xPos = 0;
        var yPos = 0;

        while (element) {
          if (element.tagName == "BODY") {
            // deal with browser quirks with body/window/document and page scroll
            var xScroll = element.scrollLeft || document.documentElement.scrollLeft;
            var yScroll = element.scrollTop || document.documentElement.scrollTop;

            xPos += (element.offsetLeft - xScroll + element.clientLeft);
            yPos += (element.offsetTop - yScroll + element.clientTop);
          } else {
            // for all other non-BODY elements
            xPos += (element.offsetLeft - element.scrollLeft + element.clientLeft);
            yPos += (element.offsetTop - element.scrollTop + element.clientTop);
          }

          element = element.offsetParent;
        }
        return {
          x: xPos,
          y: yPos
        };
      }

      const elementPosition = getPosition(elem);

      elem.dispatchEvent(
        new WheelEvent('wheel', {
          bubbles: true,
          cancelable: true,
          clientX: elementPosition.x + x,
          clientY: elementPosition.y + y,
          deltaX: deltaX,
          deltaY: deltaY,
        })
      );
    }, cssSelector, x, y, deltaX, deltaY);
  }

  mouseWheelAtRepeat(cssSelector, x, y, deltaX, deltaY, repeat) {
    let promise = Promise.resolve();
    for (let repeatCount = 0; repeatCount < repeat; repeatCount++) {
      promise = promise.then(() => this.mouseWheelAt(cssSelector, x, y, deltaX, deltaY));
    }

    return promise;
  }
}

export default InteractionService;
