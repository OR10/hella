class LinearLabelStructureAnnotationService {
  annotate(structure, annotation) {
    return [
      {name: "weather", value: "foggy", metadata: {question: "Wie ist das Wetter?"}}
      ...
    ]
  }
}
