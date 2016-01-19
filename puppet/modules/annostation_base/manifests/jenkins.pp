class annostation_base::jenkins(
) {
  file { '/home/ubuntu/.jspm/':
    ensure  => directory,
    owner   => 'ubuntu',
    mode    => '0700',
  }

  file { '/home/ubuntu/.jspm/config':
    ensure  => file,
    source  => 'puppet:///modules/annostation_base/jenkins/jspm.config',
    owner   => 'ubuntu',
    mode    => '0770',
  }

  file { '/home/ubuntu/.composer/':
    ensure  => directory,
    owner   => 'ubuntu',
    mode    => '0600',
  }

  file { '/home/ubuntu/.composer/auth.json':
    ensure  => file,
    source  => 'puppet:///modules/annostation_base/jenkins/composer.auth.json',
    owner   => 'ubuntu',
    mode    => '0600',
  }
}
