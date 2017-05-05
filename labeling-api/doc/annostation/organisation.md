# Group Organisations

## Get an Organisations List [/api/organisation]

### Get an Organisations List [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(Organisation)
        
## Get a single organisation [/api/organisation/{organisationId}]

+ Parameters
    + organisationId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the organisation.

### Get a single organisation [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(Organisation)

## Add a new organisation [/api/organisation]

### Add a new organisation [POST]

+ Response 200 (application/json)
    + Attributes
        + result (Organisation)

## Update an organisation [/api/organisation/{organisationId}]

+ Parameters
    + organisationId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Update an organisation [PUT]
+ Request (application/json)
    + Attributes (Organisation)

+ Response 200 (application/json)
    + Attributes
        + result (Organisation)

## Delete an organisation [/api/organisation/{organisationId}]

+ Parameters
    + organisationId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Delete an organisation [DELETE]

+ Response 200 (application/json)
    + Attributes
        + result: true