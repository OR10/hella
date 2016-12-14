import {
  getTextContentFromElementFinder,
  hasClassByElementFinder,
} from './Helpers';

/**
 * Protractor Helper to properly test the `LabelSelector` directive rendered on the
 * right side of the Userinterface
 *
 * Currently only the pane based view of the `LabelSelector` is handled properly. The wizzard like interface is
 * not matched yet.
 */
class LabelSelectorHelper {
  /**
   * Construct a new helper for a specific `LabelSelector` directive.
   *
   * The base {@link ElementFinder} to the directives root element needs to be provided for construction.
   *
   * @param {ElementFinder} labelSelector
   */
  constructor(labelSelector) {
    /**
     * @type {ElementFinder}
     */
    this._labelSelector = labelSelector;
  }

  /**
   * Switch the `LabelSelector` into "single selection mode"
   *
   * The mode change is no dependent of the mode the selector was in. Therefore multiple calls to this method
   * do no harm.
   *
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
   * Switch the `LabelSelector` into "multi selection mode"
   *
   * The mode change is no dependent of the mode the selector was in. Therefore multiple calls to this method
   * do no harm.
   *
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
   * Get an array of all the Titles currently visible in the `LabelSelector`.
   *
   * `Titles` are the description label of the different panes visible in the selector.
   *
   * The `titles` are returned as strings.
   *
   * @returns {webdriver.promise.Promise.<Array.<string>>}
   */
  getTitleTexts() {
    const panes = this._getPanesFinderArray();
    const titles = panes.all(by.css('.title'));
    const titleTexts = titles.map(titleElement => getTextContentFromElementFinder(titleElement));
    return titleTexts;
  }

  /**
   * Get the number currently available panes.
   *
   * @returns {webdriver.promise.Promise.<int>}
   */
  getNumberOfPanes() {
    return this._getPanesFinderArray().count();
  }

  /**
   * Get an object containing all the `values` as well as `titles` of the `LabelSelector`.
   *
   * The returned object has a key for each title (pane) associated with an array of strings representing its
   * entries:
   *
   * ```
   * {
   *  "Occlusion": [
   *    "20%",
   *    "30%",
   *    ...
   *  ],
   *  "Truncation": [
   *    "20%",
   *    "30%",
   *    ...
   *  ],
   *  ...
   * }
   * ```
   *
   * @returns {webdriver.promise.Promise.<object>}
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
   * Get the click target for a specific entry (to enable/disable it) using the title of the pane and the entry value.
   *
   * @param {string} titleText
   * @param {string} entryText
   * @returns {ElementFinder}
   */
  getEntryClickTargetFinderByTitleTextAndEntryText(titleText, entryText) {
    const pane = this._getPaneFinderByTitleText(titleText);
    const clickTarget = this._getEntryClickTargetFinderByPaneFinderAndEntryText(pane, entryText);
    return clickTarget;
  }

  /**
   * Get the click target for a specific pane (to open/close) it using its title.
   *
   * @param {string} titleText
   * @returns {ElementFinder}
   */
  getTitleClickTargetFinderByTitleText(titleText) {
    const pane = this._getPaneFinderByTitleText(titleText);
    const clickTarget = pane.element(by.css('v-pane-header'));
    return clickTarget;
  }

  /**
   * Get information about selected entries (classes) inside a certain pane identified by its title
   *
   * The returned value will be an object containing a mapping of the entries text to its selection state as boolean:
   *
   * ```
   * {
   *  "20%": false,
   *  "30%": true,
   *  ...
   * }
   * ```
   *
   * Even though technically only ONE entry (class) should be selected at a time. We need to be able to ensure the UI
   * does not display something wrong here. Therefore all selection states are reported.
   *
   * @param {string} titleText
   * @returns {webdriver.promise.Promise}
   */
  getEntrySelectionStatesByTitleText(titleText) {
    const pane = this._getPaneFinderByTitleText(titleText);
    return this._getEntriesTextFromPane(pane)
      .then(entryTexts => {
        const selectionPromises = entryTexts.map(entryText => {
          const clickTargetFinder = this._getEntryCheckboxFinderByPaneFinderAndEntryText(pane, entryText);
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
   * Determine if a certain pane identified by its title is open or closes
   *
   * @param {string} titleText
   * @returns {webdriver.promise.Promise.<boolean>}
   */
  getOpenStateByTitleText(titleText) {
    const pane = this._getPaneFinderByTitleText(titleText);
    return hasClassByElementFinder(pane, 'is-expanded');
  }

   /**
   * Get information about all opened panes
   *
   * The returned value will be an object containing a mapping of the pane title texts to their open/closes state as boolean:
   *
   * ```
   * {
   *  "Truncation": false,
   *  "Occlusion": true,
   *  ...
   * }
   * ```
   *
   * @returns {webdriver.promise.Promise.<object>}
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
   * Get information about all opened panes and selected entries in one structure
   *
   * The returned value will be a combination of open/closed and entrySelection states
   *
   * ```
   * {
   *  "Truncation": {
   *    open: false,
   *    entrySelectionStates: {
   *      '20%': false,
   *      '30%': true,
   *      ...
   *    },
   *  }
   *  "Occlusion": {...},
   *  ...
   * }
   * ```
   *
   * @returns {webdriver.promise.Promise.<object>}
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
   * Get a an array of all the entries text representations from a certain pane identified by its title text
   *
   * @param {string} titleText
   * @returns {webdriver.promise.Promise.<Array.<string>>}
   */
  getEntriesTextByTitleText(titleText) {
    const pane = this._getPaneFinderByTitleText(titleText);
    const entries = this._getEntriesTextFromPane(pane);
    return entries;
  }

  /**
   * @returns {webdriver.promise.Promise}
   * @private
   */
  _getEntriesTextFromPane(pane) {
    const content = pane.element(by.css('v-pane-content'));
    const entries = content.all(by.css('span.response'));
    return entries.map(entry => getTextContentFromElementFinder(entry));
  }

  /**
   * @returns {ElementFinder}
   * @private
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
  _getHtmlListEntryFinderByPaneFinderAndEntryText(pane, entryText) {
    const content = pane.element(by.css('v-pane-content'));
    const listEntries = content.all(by.css('li'));
    const targetListEntry = listEntries.filter(listEntry => {
      const entryTextFinder = listEntry.element(by.css('span.response'));
      return getTextContentFromElementFinder(entryTextFinder)
        .then(possibleEntryText => possibleEntryText === entryText);
    }).first();

    return targetListEntry;
  }

  /**
   * @returns {ElementFinder}
   * @private
   */
  _getEntryClickTargetFinderByPaneFinderAndEntryText(pane, entryText) {
    const listEntryFinder = this._getHtmlListEntryFinderByPaneFinderAndEntryText(pane, entryText);
    return listEntryFinder.element(by.css('label'));
  }

  /**
   * @returns {ElementFinder}
   * @private
   */
  _getEntryCheckboxFinderByPaneFinderAndEntryText(pane, entryText) {
    const listEntryFinder = this._getHtmlListEntryFinderByPaneFinderAndEntryText(pane, entryText);
    return listEntryFinder.element(by.css('input'));
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
