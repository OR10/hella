import JsonTemplateComparator from '../../JsonTemplateComparator';
import {cloneDeep} from 'lodash';

module.exports = function toContainNamedParamsRequest() {
  const comparator = new JsonTemplateComparator();

  function containsNamedParamsRequest(mockedRequests, namedParamsRequest) {
    const expectedRequest = cloneDeep(namedParamsRequest);
    if ('namedParams' in expectedRequest) {
      delete expectedRequest.namedParams;
    }

    for (let index = 0; index < mockedRequests.length; index++) {
      try {
        comparator.assertIsEqual(expectedRequest, mockedRequests[index]);
      } catch (error) {
        continue;
      }

      return true;
    }

    return false;
  }

  return {
    compare: function compare(mockedRequests, namedParamsMock) {
      const namedParamsRequest = namedParamsMock.request;
      return {
        pass: containsNamedParamsRequest(mockedRequests, namedParamsRequest),
        message: `NamedParamsRequest is no part of mocked requests:\n ${JSON.stringify(namedParamsRequest, undefined, 2)}\nnot found in\n${JSON.stringify(mockedRequests, undefined, 2)}`,
      };
    },
  };
};
