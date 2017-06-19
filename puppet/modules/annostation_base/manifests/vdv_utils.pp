class annostation_base::vdv_utils(
) {
  $_packages = [
    'cifs-utils',
    'libqt5core5a',
  ]

  package { $_packages:
    ensure => present,
  }
}
