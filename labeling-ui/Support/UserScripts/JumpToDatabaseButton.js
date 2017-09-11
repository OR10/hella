// ==UserScript==
// @name        JumpToDatabaseButton
// @description Show a button in an opened Task to directly jump to its couchdb management interface
// @match       http://localhost:54321/labeling/*
// @match       http://weblabel.hella-aglaia.com/labeling/*
// @match       https://weblabel.hella-aglaia.com/labeling/*
// ==/UserScript==

(function () { // eslint-disable-line func-names
  const databaseMapping = {
    'localhost:54321': `http://192.168.222.20:5984/_utils/database.html?{{database}}`,
    'weblabel.hella-aglaia.com': `http://localhost:15894/_utils/database.html?{{database}}`,
  };

  const pathnameRegExp = /^.*\/organisation\/[^/]+\/projects\/([^/]+)\/tasks\/([^/]+)\/labeling.*$/;

  function getLinkTargetFromHostAndPathname(host, pathname) {
    const databaseLinkTemplate = databaseMapping[host];

    if (databaseLinkTemplate === undefined) {
      console.warn('UserScript: No database url mapping found for host:', host); // eslint-disable-line no-console
      return false;
    }

    const databaseName = pathname.replace(
      pathnameRegExp,
      'taskdb-project-$1-task-$2'
    );

    return databaseLinkTemplate.replace('{{database}}', databaseName);
  }

  function createAndInjectButton(injectionContainer, linkTarget) {
    const buttonTemplate = `
    <div class="shrink noscroll">
      <a href='#' class="grid-block noscroll">
        <i class="icon-fa fa fa-lg fa-database"></i>
      </a>
    </div>
  `;

    const buttonElement = document.createElement('div');
    buttonElement.setAttribute('class', 'grid-block noscroll');
    buttonElement.innerHTML = buttonTemplate;

    const linkElement = buttonElement.querySelector('a');
    linkElement.setAttribute('href', linkTarget);

    injectionContainer.appendChild(buttonElement);
  }

  function waitForCssSelectorAndExecute(selector, callback) {
    const waitDelay = 500;
    const maxWaitCycles = 500;

    let waitCycles = 0;

    function doWait() {
      setTimeout(() => {
        const selection = document.querySelector(selector);
        if (selection !== null) {
          callback(selector, selection);
          return;
        }

        if (waitCycles++ < maxWaitCycles) {
          doWait();
        } else {
          console.warn('UserScript: Maximum wait timeout reached, while searching for header bar.'); // eslint-disable-line no-console
        }
      }, waitDelay);
    }

    doWait();
  }

  function monitorLocationPathnameChanges(pathname) {
    if (pathname.match(pathnameRegExp) === null) {
      return;
    }

    waitForCssSelectorAndExecute('viewer-title-bar > .header > .header-right', (selector, selection) => {
      createAndInjectButton(selection, getLinkTargetFromHostAndPathname(window.location.host, pathname));
    });
  }

  // Register pathname monitoring
  let lastPathname = null;

  setInterval(() => {
    if (lastPathname === window.location.pathname) {
      return;
    }

    lastPathname = window.location.pathname;
    setTimeout(() => monitorLocationPathnameChanges(window.location.pathname), 1);
  }, 300);
})();
