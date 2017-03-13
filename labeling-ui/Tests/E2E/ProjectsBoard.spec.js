import mock from 'protractor-http-mock';
import {expectAllModalsToBeClosed, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';
import GridObjectTest from '../Support/angular-ui-grid';

// Tests are skipped until they are updated for the new pagination view
xdescribe('Project Board', () => {
  let assets;
  let sharedMocks;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [];
  });

  describe('with Role Labeler', () => {
    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.ProjectBoard.UserProfileLabeler,
        assets.mocks.ProjectBoard.UserPermissionsLabeler,
      ]);
    });

    it('should display all projects in small projects list', done => { // eslint-disable-line jasmine/missing-expect
      mock(sharedMocks.concat([
        assets.mocks.ProjectBoard.ProjectList5with0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/')
        .then(() => {
          const grid = new GridObjectTest('projectGrid');
          grid.expectRowCount(5);
          done();
        });
    });

    it('should display all relevant rows', done => { // eslint-disable-line jasmine/missing-expect
      mock(sharedMocks.concat([
        assets.mocks.ProjectBoard.ProjectList5with0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/')
        .then(() => {
          const grid = new GridObjectTest('projectGrid');
          grid.expectHeaderColumnCount(3);
          grid.expectHeaderColumns([
            'Status',
            'Name',
            '% finished',
          ]);
          done();
        });
    });

    it('should display correct data in small projects list', done => { // eslint-disable-line jasmine/missing-expect
      mock(sharedMocks.concat([
        assets.mocks.ProjectBoard.ProjectList5with0to4,
      ]));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/')
        .then(() => {
          const grid = new GridObjectTest('projectGrid');
          grid.expectRowValuesMatch(0, ['in_progress', 'Test project entry No. 1', '82%']);
          grid.expectRowValuesMatch(1, ['todo', 'Test project entry No. 2', '53%']);
          grid.expectRowValuesMatch(2, ['in_progress', 'Test project entry No. 3', '100%']);
          grid.expectRowValuesMatch(3, ['done', 'Test project entry No. 4', '44%']);
          grid.expectRowValuesMatch(4, ['done', 'Test project entry No. 5', '2%']);
          done();
        });
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
