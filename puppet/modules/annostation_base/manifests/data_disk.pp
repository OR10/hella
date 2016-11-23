class annostation_base::data_disk(
  $path = '/stor',
) {
  file { $path:
    ensure => directory,
    mode   => "777",
  }
}
