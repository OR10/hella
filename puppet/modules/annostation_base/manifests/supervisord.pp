class annostation_base::supervisord()
{
  include ::supervisord

  # required to install supervisord for the workers
  package { 'python-pip':
    ensure => present,
    before => Exec['install_setuptools'],
  }

  exec { 'restart supervisord':
    refreshonly => true,
    command     => 'service supervisord restart',
    path        => '/bin:/usr/bin:/sbin:/usr/sbin',
    user        => 'root',
  }
}
