class annostation_base::github_tokens(
  $user,
  $home_dir = undef,
) {
  if $home_dir == undef {
    $_homeDir = "/home/${user}"
  } else {
    $_homeDir = $home_dir
  }

  file { "${_homeDir}/.jspm/":
    ensure  => directory,
    owner   => $user,
    mode    => '0700',
  }

  file { "${_homeDir}/.jspm/config":
    ensure  => file,
    source  => 'puppet:///modules/annostation_base/github_tokens/jspm.config',
    owner   => $user,
    mode    => '0770',
  }

  file { "${_homeDir}/.composer/":
    ensure  => directory,
    owner   => $user,
    mode    => '0600',
  }

  file { "${_homeDir}/.composer/auth.json":
    ensure  => file,
    source  => 'puppet:///modules/annostation_base/github_tokens/composer.auth.json',
    owner   => $user,
    mode    => '0600',
  }
}
