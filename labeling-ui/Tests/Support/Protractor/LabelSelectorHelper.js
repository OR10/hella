import {
  getTextContentFromElementFinder,
  hasClassByElementFinder,
} from './Helpers';

class LabelSelectorHelper {
  constructor(labelSelector) {
    /**
     * @type {ElementFinder}
     */
    this._labelSelector = labelSelector;
  }

  /**
   * @returns {webdriver.promise.Promise}
   */
  switchToSingleSelectMode() {
    const modeSelectCheckboxFinder = this._getModeSelectCheckboxFinder();
    return modeSelectCheckboxFinder.isSelected()
      .then(isInMultiMode => {
        if (isInMultiMode) {
          return modeSelectCheckboxFinder.click();
        }
      });
  }

  /**
   * @returns {webdriver.promise.Promise}
   */
  switchToMultiSelectMode() {
    const modeSelectCheckboxFinder = this._getModeSelectCheckboxFinder();
    return modeSelectCheckboxFinder.isSelected()
      .then(isInMultiMode => {
        if (!isInMultiMode) {
          return modeSelectCheckboxFinder.click();
        }
      });
  }

  /**
   * @returns {webdriver.promise.Promise}
   */
  getTitleTexts() {
    const panes = this._getPanesFinderArray();
    const titles = panes.all(by.css('.title'));
    const titleTexts = titles.map(titleElement => getTextContentFromElementFinder(titleElement));
    return titleTexts;
  }

  /**
   * @returns {webdriver.promise.Promise}
   */
  getNumberOfPanes() {
    return this._getPanesFinderArray().count();
  }

  /**
   * @returns {webdriver.promise.Promise}
   */
  getAllEntryTexts() {
    return this.getTitleTexts()
      .then(titles => {
        const entryPromises = titles.map(title => this.getEntriesTextByTitleText(title));
        return Promise.all([Promise.resolve(titles), Promise.all(entryPromises)]);
      })
      .then(([titles, entriesByPaneIndex]) => {
        const entriesMapping = {};
        titles.forEach((title, index) => entriesMapping[title] = entriesByPaneIndex[index]);
        return entriesMapping;
      });
  }

  /**
   * @returns {ElementFinder}
   */
  getEntryClickTargetFinderByTitleTextAndEntryText(titleText, entryText) {
    const pane = this._getPaneFinderByTitleText(titleText);
    const clickTarget = this._getEntryClickTargetFinderByPaneFinderAndEntryText(pane, entryText);
    return clickTarget;
  }

  /**
   * @returns {ElementFinder}
   */
  getTitleClickTargetFinderByTitleText(titleText) {
    const pane = this._getPaneFinderByTitleText(titleText);
    const clickTarget = pane.element(by.css('v-pane-header'));
    return clickTarget;
  }

  /**
   * @returns {webdriver.promise.Promise}
   */
  getEntrySelectionStatesByTitleText(titleText) {
    const pane = this._getPaneFinderByTitleText(titleText);
    return this._getEntriesTextFromPane(pane)
      .then(entryTexts => {
        const selectionPromises = entryTexts.map(entryText => {
          const clickTargetFinder = this._getEntryClickTargetFinderByPaneFinderAndEntryText(pane, entryText);
          return clickTargetFinder.isSelected();
        });

        return Promise.all([Promise.resolve(entryTexts), Promise.all(selectionPromises)]);
      })
      .then(([entryTexts, selectedStateByIndex]) => {
        const selectedStateMap = {};
        entryTexts.forEach((entryText, index) => selectedStateMap[entryText] = selectedStateByIndex[index]);
        return selectedStateMap;
      });
  }

  /**
   * @returns {webdriver.promise.Promise}
   */
  getOpenStateByTitleText(titleText) {
    const pane = this._getPaneFinderByTitleText(titleText);
    return hasClassByElementFinder(pane, 'is-expanded');
  }

  /**
   * @returns {webdriver.promise.Promise}
   */
  getAllOpenStates() {
    return this.getTitleTexts()
      .then(titleTexts => {
        const titleOpenStatePromises = titleTexts.map(titleText => this.getOpenStateByTitleText(titleText));

        return Promise.all([
          Promise.resolve(titleTexts),
          Promise.all(titleOpenStatePromises),
        ]);
      })
      .then(([titles, titleOpenStateByIndex]) => {
        const stateMapping = {};
        titles.forEach(
          (title, index) => stateMapping[title] = titleOpenStateByIndex[index]
        );
        return stateMapping;
      });
  }

  /**
   * @returns {webdriver.promise.Promise}
   */
  getAllStates() {
    return this.getTitleTexts()
      .then(titleTexts => {
        const titleOpenStatePromises = titleTexts.map(titleText => this.getOpenStateByTitleText(titleText));
        const entrySelectionStatePromises = titleTexts.map(titleText => this.getEntrySelectionStatesByTitleText(titleText));

        return Promise.all([
          Promise.resolve(titleTexts),
          Promise.all(titleOpenStatePromises),
          Promise.all(entrySelectionStatePromises)
        ]);
      })
      .then(([titles, titleOpenStateByIndex, entrySelectionStatesByIndex]) => {
        const stateMapping = {};
        titles.forEach(
          (title, index) => stateMapping[title] = {
            open: titleOpenStateByIndex[index],
            entrySelectionStates: entrySelectionStatesByIndex[index],
          }
        );
        return stateMapping;
      });
  }

  /**
   * @returns {webdriver.promise.Promise}
   */
  getEntriesTextByTitleText(titleText) {
    const pane = this._getPaneFinderByTitleText(titleText);
    const entries = this._getEntriesTextFromPane(pane);
    return entries;
  }

  /**
   * @returns {webdriver.promise.Promise}
   */
  _getEntriesTextFromPane(pane) {
    const content = pane.element(by.css('v-pane-content'));
    const entries = content.all(by.css('span.response'));
    return entries.map(entry => getTextContentFromElementFinder(entry));
  }

  /**
   * @returns {ElementFinder}
   */
  _getPaneFinderByTitleText(titleText) {
    const panes = this._getPanesFinderArray();
    const filteredPanes = panes.filter(pane => {
      const titleElement = pane.element(by.css('.title'));
      return getTextContentFromElementFinder(titleElement).then(
        possibleTitleText => possibleTitleText === titleText
      );
    });
    return filteredPanes.first();
  }

  /**
   * @returns {ElementFinder}
   * @private
   */
  _getAccordionFinder() {
    return this._labelSelector.element(by.css('v-accordion'));
  }

  /**
   * @returns {ElementArrayFinder}
   * @private
   */
  _getPanesFinderArray() {
    const accordion = this._getAccordionFinder();
    return accordion.all(by.css('v-pane'));
  }

  /**
   * @returns {ElementFinder}
   * @private
   */
  _getEntryClickTargetFinderByPaneFinderAndEntryText(pane, entryText) {
    const content = pane.element(by.css('v-pane-content'));
    const listEntries = content.all(by.css('li'));
    const targetListEntry = listEntries.filter(listEntry => {
      const entryTextFinder = listEntry.element(by.css('span.response'));
      return getTextContentFromElementFinder(entryTextFinder)
        .then(possibleEntryText => possibleEntryText === entryText);
    }).first();

    return targetListEntry.element(by.css('input'));
  }

  /**
   * @returns {ElementFinder}
   * @private
   */
  _getModeSelectCheckboxFinder() {
    return this._labelSelector.element(by.model('vm.multiSelection'));
  }
}

export default LabelSelectorHelper;
