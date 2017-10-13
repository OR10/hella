class annostation_letsencrypt(
    $webroot = '/var/www/letsencrypt',
    $domains = [],
    $existingVhosts = undef,
) {
    include ::letsencrypt

    file { $webroot:
        ensure => directory,
    }

    if !$existingVhosts {
        annostation_base::nginx_vhost { 'letsencrypt':
            serverNames       => $domains,
            vhostDir          => $webroot,
            vhostPort         => 80,
            tryFiles          => ['$uri', '$uri/', '=404'],
            require           => File[$webroot],
        }

        $_vhosts = ['letsencrypt']
    } else {
        $_vhosts = $existingVhosts
    }

    $_vhosts.each |$_vhost| {
        nginx::resource::location { "${_vhost}_acme-challenge":
            ensure              => present,
            vhost               => $_vhost,
            www_root            => $webroot,
            location_cfg_append => {
                default_type => 'text/plain',
            },
            require             => File[$webroot],
            location            => '~ /.well-known/acme-challenge/(.*)',
        }
    }

    $domains.each |$domain| {
        ::letsencrypt::certonly { $domain:
            domains => [$domain],
            plugin => 'webroot',
            webroot_paths => [$webroot],
            manage_cron => true,
            cron_success_command => '/usr/sbin/service nginx reload',
        }
    }
}
