import $ from 'jquery';
import angular from 'angular';
import angularMocks from 'angular-mocks';

import Common from 'Application/Common/Common';
import videoListResponse from './../Fixtures/videolist.json!';

describe('VideoList', function() {
  let $compile;
  let $rootScope;
  let $http;
  let $httpBackend;

  const commonModule = new Common();

  commonModule.registerWithAngular(angular);

  beforeEach(angularMocks.module('AnnoStation.Common'));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(angularMocks.inject(function($injector) {
    $compile = $injector.get('$compile');
    $rootScope = $injector.get('$rootScope');
    $httpBackend = $injector.get('$httpBackend');
    $http = $injector.get('$http');
  }));

  it('should show a list of videos as received via http request', () => {
    $httpBackend
      .expectGET('/api/video/list')
      .respond(videoListResponse);

    const directiveRootElement = $compile('<videolist></videolist>')($rootScope);
    $rootScope.$digest();

    $httpBackend.flush();

    const ul = directiveRootElement[0].childNodes.item(6);
    expect(ul.nodeName).toBe('UL');

    const lis = Array.prototype.slice.call(ul.childNodes).filter((node) => node.nodeType === node.ELEMENT_NODE);

    expect(lis[0].textContent).toBe('d689baf5655b18ac563ddc9f1b015f14');
  });
});
