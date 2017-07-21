import Module from '../Module';

import ViewerDirective from './Directives/ViewerDirective';

import PaperShapeFactory from './Shapes/PaperShapeFactory';
import ToolService from './Services/ToolService';

import ViewerMouseCursorService from './Services/ViewerMouseCursorService';
import LabeledThingGroupService from './Services/LabeledThingGroupService';
import HierarchyCreationService from './Services/HierarchyCreationService';
import GroupShapeNameService from './Services/GroupShapeNameService';

import DrawingContextServiceProvider from './Providers/DrawingContextServiceProvider';

import 'jquery-mousewheel';

/**
 * @class MediaControls
 */
export default class Viewer extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Viewer', []);

    this.registerDirective('viewer', ViewerDirective);

    this.module.service('paperShapeFactory', PaperShapeFactory);
    this.module.service('toolService', ToolService);
    this.module.service('viewerMouseCursorService', ViewerMouseCursorService);
    this.module.service('labeledThingGroupService', LabeledThingGroupService);
    this.module.service('hierarchyCreationService', HierarchyCreationService);
    this.module.service('groupShapeNameService', GroupShapeNameService);

    this.module.provider('drawingContextService', DrawingContextServiceProvider);
  }
}
