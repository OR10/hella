class labeling_api::vagrant_composer_install (
    $root_dir = '/vagrant',
    $user = 'vagrant',
    $composer_home = '/home/vagrant/.composer',
) {
  exec { 'composer-install-labelstation':
    command     => '/usr/local/bin/composer install --no-interaction',
    cwd         => $root_dir,
    creates     => "${root_dir}/vendor",
    environment => ["COMPOSER_HOME=${composer_home}"],
    require     => Class['php::composer'],
    user        => $user,
  }
}
