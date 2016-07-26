class annostation_letsencrypt(
    $webroot = '/var/www/letsencrypt',
    $domain,
) {
    file { $webroot:
        ensure => directory,
    }

    annostation_base::nginx_vhost { 'letsencrypt':
        vhostDir          => $webroot,
        vhostPort         => 80,
        tryFiles          => ['$uri', '$uri/', '=404'],
        require           => File[$webroot],
    }

    nginx::resource::location { '/.well-known/acme-challenge/(.*)':
        vhost => 'letsencrypt',
        location_alias => $webroot,
        location_cfg_append => {
            default_type => 'text/plain',
        },
        require => File[$webroot],
    }

    ::letsencrypt::certonly { $domain:
        domains => [$domain],
        plugin => 'webroot',
        webroot_paths => [$webroot],
        manage_cron => true,
        cron_success_command => '/usr/sbin/service nginx reload',
    }
}
