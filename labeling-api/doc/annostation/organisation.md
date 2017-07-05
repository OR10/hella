# Group Organisations

## Get an Organisations List [/api/organisation]

Get a list of all organisations

### Get an Organisations List [GET]

+ Response 200 (application/json)
    + Attributes
        + result array(Organisation)

## Add a new organisation [/api/organisation]

Add a new organisation

### Add a new organisation [POST]

+ Request (application/json)
    + Attributes
        + name: `Some Organisation Name` (string) An organisation name
        + quota: `0` (number) Limit the storage usage in byte
        + userQuota: `0` (number) Limit the number of Users in this organisation

+ Response 200 (application/json)
    + Attributes
        + result (Organisation)

## Update an organisation [/api/organisation/{organisationId}]

Change an organisation

+ Parameters
    + organisationId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Update an organisation [PUT]
+ Request (application/json)
    + Attributes
        + _rev: `5-1e41bd314fe55a9c3949230aa463943b` (string) Rev of the document
        + name: `Some Organisation Name` (string) An organisation name
        + quota: `0` (number) Limit the storage usage in byte
        + userQuota: `0` (number) Limit the number of Users in this organisation

+ Response 200 (application/json)
    + Attributes
        + result (Organisation)

## Delete an organisation [/api/organisation/{organisationId}]

Delete a organisation

+ Parameters
    + organisationId: `e47f4bdfd22883b196ce45a8c980ab68` (string, required) - The id of the labeling group.

### Delete an organisation [DELETE]

+ Response 200 (application/json)
    + Attributes
        + result: true