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
  $frameCdnDir = $labeling_api::params::frame_cdn_dir,
) {
  if $frameCdnDir =~ /^(\/.+)\/[^\/]+/ {
    $frameCdnDirectory = [$1, $frameCdnDir]
  } else {
    $frameCdnDirectory = $frameCdnDir
  }

  file { $cacheDir:
    ensure => 'directory',
    mode   => "777",
  }

  file { $frameCdnDirectory:
    ensure => 'directory',
    mode   => "777",
  }
}
