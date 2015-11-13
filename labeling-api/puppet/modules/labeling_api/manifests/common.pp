/**
 * Common class for different labeling_api roles.
 *
 * This is required on some of the machines but cannot be defined in each
 * separate class because it would cause duplicate resources and I don't know
 * how to solve this issue in a different and maybe more clean way.
 *
 * If you read this and you know a better solution, please feel free to
 * refactor this code to make the world a better place. ;-)
 */
class labeling_api::common(
) {

    file { '/var/cache/labeling_api': 
      ensure => 'directory',
      mode   => "777",
    }

    file { '/var/www': 
      ensure => 'directory',
    }

    file { '/var/www/frame_cdn': 
      ensure => 'directory',
      require => File['/var/www'],
    }
}
