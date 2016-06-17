# Group Dimension Prediction

## All labeled things [/api/dimensionPrediction/{labeledThingId}/{frameIndexNumber}]

+ Parameters
    + labeledThingId: `870a3de3-7535-4b31-967c-a22b307b06a7` (string, required) - The id of the labeledThing.
    + frameIndexNumber: `11` (integer, required) - The id of the frame index.

### Fetch the next labeled thing dimensions [GET]

AT THIS TIME, THIS ROUTE ALWAYS RETURN 1 FOR EVERY SIZE

This route simply returns the next dimensions for the labeledThing

+ Response 200 (application/json)
    + Attributes
        + result (array[DimensionPrediction])