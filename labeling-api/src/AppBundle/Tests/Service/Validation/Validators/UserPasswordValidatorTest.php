<?php

namespace AppBundle\Tests\Service\Validation\Validators;

use AppBundle\Model\User;
use AppBundle\Service\Validation\Model\VerifyUserPassword;
use AppBundle\Service\Validation\ValidationError;
use AppBundle\Service\Validation\Validators\UserPasswordValidator;
use AppBundle\Tests;
use Phake;
use Symfony\Component\Security\Core\Encoder\EncoderFactory;
use Symfony\Component\Security\Core\Encoder\PasswordEncoderInterface;

/**
 * @group AppBundle
 * @group UnitTests
 */
class UserPasswordValidatorTest extends Tests\KernelTestCase
{

    /**
     * @var EncoderFactory
     */
    private $encoderFactory;

    /**
     * @var PasswordEncoderInterface
     */
    private $encoder;

    public function testPasswordValidatorValidPassword()
    {
        $this->markTestSkipped('fix me');

        $userPasswordValidator = new UserPasswordValidator($this->encoderFactory);
        $user                  = new User();
        $password              = "foo";

        Phake::when($this->encoder)->isPasswordValid(Phake::anyParameters())->thenReturn(true);

        $result = $userPasswordValidator->validate(new VerifyUserPassword($user, $password));
        $this->assertEquals([], $result);
    }

    public function testPasswordValidatorInvalidPassword()
    {
        $this->markTestSkipped('fix me');

        $userPasswordValidator = new UserPasswordValidator($this->encoderFactory);
        $user                  = new User();
        $password              = "foo";

        Phake::when($this->encoder)->isPasswordValid(Phake::anyParameters())->thenReturn(false);
        $result = $userPasswordValidator->validate(new VerifyUserPassword($user, $password));

        $this->assertEquals([new ValidationError("currentPassword", "The current password is invalid.")], $result);
    }

    public function testPasswordValidatorSupportsVerifyUserPassword()
    {
        $this->markTestSkipped('fix me');

        $userPasswordValidator = new UserPasswordValidator($this->encoderFactory);
        $this->assertTrue($userPasswordValidator->supports(new VerifyUserPassword(new User(), "foo")));
    }

    public function setUpImplementation()
    {
        $this->encoderFactory = Phake::mock(EncoderFactory::class);
        $this->encoder        = Phake::mock(PasswordEncoderInterface::class);
        Phake::when($this->encoderFactory)->getEncoder(Phake::anyParameters())->thenReturn($this->encoder);
    }
}
