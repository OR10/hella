class labeling_api::app(
  $root_dir,
  $cache_dir = $labeling_api::params::cache_dir,
  $configure_nginx = $labeling_api::params::configure_nginx,
  $app_main_script = 'app.php',
  $labeling_ui_dir = '/var/www/labeling-ui',
  $client_max_body_size = '512M',
  $is_vagrant_vm = false,
  $port = 80,
  $httpv2 = false,
) {
  include ::labeling_api::common

  ::annostation_base::symfony { 'labeling_api':
    app_path => $root_dir,
    configure_nginx => $configure_nginx,
    app_main_script => $app_main_script,
    client_max_body_size => $client_max_body_size,
    port => $port,
    httpv2 => $httpv2,
    not_found_redirect => '/labeling/index.html',
  }

  if $configure_nginx {
    $_uiLocationCfgAppend = {
      try_files => '$uri /labeling/index.html',
    }

    nginx::resource::location { '/labeling':
      ssl                 => $httpv2,
      ssl_only            => $httpv2,
      ensure              => present,
      vhost               => 'labeling_api',
      location_alias      => $labeling_ui_dir,
      location_cfg_append => $_uiLocationCfgAppend,
    }
  }

  if $is_vagrant_vm {
    file { $labeling_ui_dir:
      ensure => 'link',
      target => '/labeling-ui/Distribution',
    }
  }
}
