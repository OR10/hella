# Group Campaign

Projects can have several relations to campaigns. 

## Campaign [/api/v1/organisation/{organisationId}/campaign]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
   
### Get the Campaigns for this Organisation [GET]

This route returns all campaigns for a given organisation

+ Response 200 (application/json)
    + Attributes
        + result array(Campaign)
   
## Campaign [/api/v1/organisation/{organisationId}/campaign]

+ Parameters
    + organisationId: `1e8662640b31b28050a9ab5eafa8371e` (string, required) - Id of the organisation.
   
### Save a Campaigns for this Organisation [POST]

Save a campaign for a given organisation. You don't need to provide an id or _rev.

+ Request (application/json)
    + Attributes (Campaign)

+ Response 200 (application/json)
    + Attributes
        + result (Campaign)

