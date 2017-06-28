import {forEach, isArray, isObject, isNumber, isString, isBoolean, isNull, isUndefined} from 'lodash';
import JsonTemplateComparator from '../../../JsonTemplateComparator';

const comparator = new JsonTemplateComparator();

// Keys that cannot be tested for the hard value in a Pouch environment
const unstableKeys = [];

// Keys that are not stored in Pouch Documents
const omitKeys = [
  'ghost',
  'ghostClasses',
];

function isScalar(value) {
  return isNumber(value) || isString(value) || isBoolean(value) || isNull(value) || isUndefined(value);
}

function isUnstableKey(key) {
  return (unstableKeys.indexOf(key) > -1);
}

function isOmittedKey(key) {
  return (omitKeys.indexOf(key) > -1);
}

function getType(template, depth) {
  if (depth === 0 && template.shapes !== undefined && template.labeledThingId !== undefined) {
    return 'AppBundle.Model.LabeledThingInFrame';
  } else if (template.startFrameIndex !== undefined && template.endFrameIndex !== undefined) {
    return 'AppBundle.Model.FrameIndexRange';
  } else if (depth === 0 && template.timeInSeconds !== undefined) {
    return 'AppBundle.Model.TaskTimer';
  } else if (depth === 0 && template.groupType !== undefined) {
    return 'AnnoStationBundle.Model.LabeledThingGroup';
  } else if (depth === 0 && template.lineColor !== undefined && template.frameRange !== undefined) {
    return 'AppBundle.Model.LabeledThing';
  } else if (depth === 0 && template.lineColor === undefined && template.frameRange !== undefined) {
    return 'AppBundle.Model.LabeledFrame';
  }

  return undefined;
}

function preprocessTemplate(template, depth = 0) {
  if (isScalar(template)) {
    return template;
  }

  // The explicit !isArray check needs to be done, since an array is also an object!
  if (isObject(template) && !isArray(template)) {
    const processedTemplate = {};
    forEach(template, (value, key) => {
      switch (true) {
        case isUnstableKey(key):
          processedTemplate[key] = `{{:--unstableKey-${key}}}`;
          break;
        case isOmittedKey(key):
          // Do not copy over key
          break;
        case key === 'rev':
          // Do not copy over key
          break;
        case key === 'id' && depth === 0:
          processedTemplate._id = preprocessTemplate(value, depth + 1);
          break;
        case key === 'startFrameNumber':
          processedTemplate.startFrameIndex = preprocessTemplate(value, depth + 1);
          break;
        case key === 'endFrameNumber':
          processedTemplate.endFrameIndex = preprocessTemplate(value, depth + 1);
          break;
        default:
          processedTemplate[key] = preprocessTemplate(value, depth + 1);
      }
    });

    const type = getType(processedTemplate, depth);
    if (type !== undefined) {
      processedTemplate.type = type;
    }

    // Add keys only available in couchdb documents, not in mocks
    if (depth === 0) {
      processedTemplate.projectId = `{{:--project-id}}`;
      processedTemplate.taskId = `{{:--task-id}}`;
      processedTemplate._rev = `{{:--revision}}`;
    }

    return processedTemplate;
  }

  if (isArray(template)) {
    const processedTemplate = template.map(value => preprocessTemplate(value, depth + 1));
    return processedTemplate;
  }

  throw new Error(`Unknown value type in mocked request/response data: ${typeof template}`);
}

export function matchDocuments(expectedTemplate, collection) {
  const processedExpectedTemplate = preprocessTemplate(expectedTemplate);
  try {
    comparator.assertDocumentIsInCollection(processedExpectedTemplate, collection);
    return {message: 'Matched', pass: true};
  } catch (error) {
    return {message: error.message, pass: false};
  }
}

