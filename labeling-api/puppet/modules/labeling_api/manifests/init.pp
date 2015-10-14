class labeling_api(
    $database_host = '127.0.0.1',
    $database_port = 'null',
    $database_name = 'symfony',
    $database_user = 'root',
    $database_password = 'null',
    $mailer_transport = 'smtp',
    $mailer_host = '127.0.0.1',
    $mailer_user = 'null',
    $mailer_password = 'null',
    $secret = 'ThisTokenIsNotSoSecretChangeIt'
) {

  file { '/vagrant/app/config/parameters.yml':
    ensure  => file,
    content => template('labeling_api/parameters.yml.erb'),
  }
}
