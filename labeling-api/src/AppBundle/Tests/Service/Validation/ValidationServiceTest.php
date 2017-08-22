<?php
namespace AppBundle\Tests\Service\Validation;

use AppBundle\Service\Validation\ValidationResult;
use AppBundle\Service\Validation\ValidationService;
use AppBundle\Service\Validation\Validator;
use AppBundle\Service\Validation\ValidatorRegistry;
use AppBundle\Tests;
use Phake;

/**
 * @group AppBundle
 * @group UnitTests
 */
class ValidationServiceTest extends Tests\KernelTestCase
{
    /**
     * @var Validator
     */
    private $mockValidator;

    /**
     * @var ValidatorRegistry
     */
    private $mockRegistry;

    public function testValidationServiceWithoutValidators()
    {
        $validationService = new ValidationService(new ValidatorRegistry());
        $this->assertEquals(new ValidationResult(), $validationService->validate(new \stdClass()));
    }

    public function testValidationServiceWithUnsupportedValidator()
    {
        $obj = new \stdClass();
        Phake::when($this->mockValidator)->supports($obj)->thenReturn(false);
        $validationService = new ValidationService($this->mockRegistry);

        $this->assertEquals(new ValidationResult(), $validationService->validate($obj));

        Phake::verify($this->mockValidator)->supports($obj);
        Phake::verifyNoFurtherInteraction($this->mockValidator);
    }

    public function testValidationServiceWithSupportedValidator()
    {
        $obj = new \stdClass();
        Phake::when($this->mockValidator)->supports($obj)->thenReturn(true);
        $validationService = new ValidationService($this->mockRegistry);

        $this->assertEquals(new ValidationResult(), $validationService->validate($obj));

        Phake::verify($this->mockValidator)->supports($obj);
        Phake::verify($this->mockValidator)->validate($obj);
        Phake::verifyNoFurtherInteraction($this->mockValidator);
    }

    public function setUpImplementation()
    {
        $this->mockValidator = Phake::mock(Validator::class);
        $this->mockRegistry  = new ValidatorRegistry();
        $this->mockRegistry->addValidator($this->mockValidator);
    }
}
