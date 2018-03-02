<?php
namespace AnnoStationBundle\Controller;

use AppBundle\Annotations\CloseSession;
use AppBundle\Model;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Session;

/**
 * @SuppressWarnings(PHPMD.NumberOfChildren)
 */
abstract class Base
{
    /**
     * @param mixed                 $input
     * @param Model\FrameIndexRange|null $defaultIfNull
     *
     * @return Model\FrameIndexRange|null
     */
    protected function createFrameRange($input, Model\FrameIndexRange $defaultIfNull = null)
    {
        if ($input === null) {
            return $defaultIfNull;
        }

        if (!is_array($input)) {
            return null;
        }

        try {
            return Model\FrameIndexRange::createFromArray($input);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * return request validation error
     * @param FormInterface $form
     * @return array
     */
    protected function getErrorsFromForm(FormInterface $form)
    {
        $errors = [];

        $counter = 0;
        foreach ($form->getErrors() as $key => $error) {
            $errors[$counter]['field'] = '';
            $errors[$counter]['message'] = $error->getMessage();;
            $counter ++;
        }

        foreach ($form->all() as $childForm) {
            if ($childForm instanceof FormInterface) {
                if ($childErrors = $this->getErrorsFromForm($childForm)) {
                    if(is_array($childErrors)) {
                        $errors[$counter]['field'] = $childForm->getName();
                        $errors[$counter]['message'] = (isset($childErrors[0]['message'])) ? $childErrors[0]['message'] : $childErrors[0];
                    } else {
                        $errors[$counter]['field'] = $childForm->getName();
                        $errors[$counter]['message'] = $childErrors;
                    }
                    $counter++;
                }
            }
        }

        return $errors;
    }
}
