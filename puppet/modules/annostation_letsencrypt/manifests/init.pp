class annostation_letsencrypt(
    $webroot = '/var/www/letsencrypt',
    $domains = [],
    $existingVhost = undef,
) {
    include ::letsencrypt

    file { $webroot:
        ensure => directory,
    }

    if !$existingVhost {
        annostation_base::nginx_vhost { 'letsencrypt':
            serverNames       => $domains,
            vhostDir          => $webroot,
            vhostPort         => 80,
            tryFiles          => ['$uri', '$uri/', '=404'],
            require           => File[$webroot],
        }

        $_vhost = 'letsencrypt'
    } else {
        $_vhost = $existingVhost
    }

    nginx::resource::location { '/.well-known/acme-challenge/(.*)':
        vhost               => $_vhost,
        www_root            => $webroot,
        location_cfg_append => {
            default_type => 'text/plain',
        },
        require             => File[$webroot],
    }

    ::letsencrypt::certonly { 'letsencrypt-certs':
        domains => $domains,
        plugin => 'webroot',
        webroot_paths => [$webroot],
        manage_cron => true,
        cron_success_command => '/usr/sbin/service nginx reload',
    }
}
