<?php
namespace AppBundle\Tests\Service\Validation\Validators;

use AppBundle\Model\User;
use AppBundle\Service\PasswordPolicyService;
use AppBundle\Service\Validation\ValidationError;
use AppBundle\Service\Validation\Validators\UserValidator;
use AppBundle\Tests;

/**
 * @group AppBundle
 * @group UnitTests
 */
class UserValidatorTest extends Tests\KernelTestCase
{

    public function isKernelRequired()
    {
        return true;
    }

    public function testInvalidMail()
    {
        $user = new User();
        $user->setEmail("not.an.email.address");

        $userValidator = new UserValidator(new PasswordPolicyService([]), $this->getService("translator"));
        $result        = $userValidator->validate($user);

        $this->assertEquals([new ValidationError("email", "This value is not a valid email address.")], $result);
    }

    public function testValidMail()
    {
        $user = new User();
        $user->setEmail("test@test.de");

        $userValidator = new UserValidator(new PasswordPolicyService([]), $this->getService("translator"));
        $result        = $userValidator->validate($user);

        $this->assertEquals([], $result);
    }

    public function testMissingMail()
    {
        $user = new User();

        $userValidator = new UserValidator(new PasswordPolicyService([]), $this->getService("translator"));
        $result        = $userValidator->validate($user);

        $this->assertEquals([new ValidationError("email", "This value should not be blank.")], $result);
    }

    public function testValidPasswordWithoutConstraints()
    {
        $user = new User();
        $user->setEmail("test@test.de");
        $user->setPlainPassword("1");

        $userValidator = new UserValidator(new PasswordPolicyService([]), $this->getService("translator"));
        $result        = $userValidator->validate($user);

        $this->assertEquals([], $result);
    }

    public function testValidPasswordWithConstraint()
    {
        $user = new User();
        $user->setEmail("test@test.de");
        $user->setPlainPassword("1$");

        $userValidator = new UserValidator(
            new PasswordPolicyService(["AtLeastOneSpecialCharacter" => true]),
            $this->getService("translator")
        );
        $result        = $userValidator->validate($user);

        $this->assertEquals([], $result);
    }

    public function testInvalidPasswordWithConstraint()
    {
        $user = new User();
        $user->setEmail("test@test.de");
        $user->setPlainPassword("1");

        $userValidator = new UserValidator(
            new PasswordPolicyService(["AtLeastOneSpecialCharacter" => true]),
            $this->getService("translator")
        );
        $result        = $userValidator->validate($user);

        $this->assertEquals(
            [new ValidationError("password", "This value should contain at least one special character.")],
            $result
        );
    }

    public function testUserValidatorSupportsUser()
    {
        $user = new User();
        $userValidator = new UserValidator(
            new PasswordPolicyService(["AtLeastOneSpecialCharacter" => true]),
            $this->getService("translator")
        );

        $this->assertTrue($userValidator->supports($user));
    }
}
