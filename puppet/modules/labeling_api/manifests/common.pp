/**
 * Common class for different labeling_api roles.
 *
 * This is required on some of the machines but cannot be defined in each
 * separate class because it would cause duplicate resources and I don't know
 * how to solve this issue in a different and maybe cleaner way.
 *
 * If you read this and you know a better solution, please feel free to
 * refactor this code to make the world a better place. ;-)
 */
class labeling_api::common(
  $cacheDir = $labeling_api::params::cache_dir,
  $deletedObjectsDir = $labeling_api::params::deleted_objects_dir,
  $frameCdnDir = $labeling_api::params::frame_cdn_dir,
  $videoCdnDir = $labeling_api::params::video_cdn_dir,
  $sslCert = undef,
) {

  if $frameCdnDir {
    if $frameCdnDir =~ /^(\/.+)\/[^\/]+/ {
      $frameCdnDirectory = [$1, $frameCdnDir]
    } else {
      $frameCdnDirectory = [$frameCdnDir]
    }
  }

  if $videoCdnDir {
    if $videoCdnDir =~ /^(\/.+)\/[^\/]+/ {
      $videoCdnDirectory = [$1, $videoCdnDir]
    } else {
      $videoCdnDirectory = [$videoCdnDir]
    }

  }

  $cdnDirectories = unique(concat($frameCdnDirectory, $videoCdnDirectory))

  file { $cdnDirectories:
    ensure => 'directory',
    mode   => "777",
  }

  file { $cacheDir:
    ensure => 'directory',
    mode   => "777",
  }

  file { "${deletedObjectsDir}":
    ensure => 'directory',
    mode   => "766",
  }

  file { "${deletedObjectsDir}/logs":
    ensure => 'directory',
    mode   => "766",
  }

  file { "${deletedObjectsDir}/files":
    ensure => 'directory',
    mode   => "766",
  }

  if $sslCert {
    file { '/etc/nginx/labeling_api-ssl-certificate.crt':
      ensure  => file,
      source  => "puppet:///modules/labeling_api/${sslCert}.crt",
      require => Package['nginx'],
    }

    file { '/etc/nginx/labeling_api-ssl-certificate.key':
      ensure  => file,
      source  => "puppet:///modules/labeling_api/${sslCert}.key",
      require => Package['nginx'],
    }
  }
}
