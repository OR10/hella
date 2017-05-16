<?php

namespace AnnoStationBundle\Service\TaskDatabaseValidateDocUpdateDocumentService;

use Doctrine\CouchDB\View;

class ValidateDocUpdateDocument implements View\DesignDocument
{
    public function getData()
    {
        return [
            'language'            => 'javascript',
            'validate_doc_update' => 'function(newDoc, oldDoc, userCtx, secObj) {
  if (userCtx.name === \'admin\' || userCtx.name === \'pouch\' || secObj.assignedLabeler === userCtx.name) {
    return;
  }
  
  throw({forbidden: \'You are not authorized to write to this db.\'});
}',
        ];
    }
}