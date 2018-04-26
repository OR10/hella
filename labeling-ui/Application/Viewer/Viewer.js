import Module from '../Module';

import ViewerDirective from './Directives/ViewerDirective';

import PaperShapeFactory from './Shapes/PaperShapeFactory';
import ToolService from './Services/ToolService';

import ViewerMouseCursorService from './Services/ViewerMouseCursorService';
import LabeledThingGroupService from './Services/LabeledThingGroupService';
import HierarchyCreationService from './Services/HierarchyCreationService';
import GroupNameService from './Services/GroupNameService';
import DrawingContextServiceProvider from './Providers/DrawingContextServiceProvider';

import 'jquery-mousewheel';
import DrawClassShapeService from './Services/DrawClassShapeService';

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
    this.module.service('groupNameService', GroupNameService);
    this.module.service('drawClassShapeService', DrawClassShapeService);


    this.module.provider('drawingContextService', DrawingContextServiceProvider);
  }
}
