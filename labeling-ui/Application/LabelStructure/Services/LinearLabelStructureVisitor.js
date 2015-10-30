//var context = {
//  weather: "foggy",
//  foggy: "really-foggy",
//  country: "germany",
//};

export default class LinearLabelStructureVisitor {
  visit(node, context) {
    return [
      {name: "weather", value: "foggy"},
      {name: "foggy", value: "really-foggy"},
      {name: "country", value: null}
    ];
  }
}

