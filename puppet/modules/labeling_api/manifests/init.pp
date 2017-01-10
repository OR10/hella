class labeling_api(
  $params = false,
  $mysql = false,
  $couch = false,
  $worker_queue = false,
  $app = false,
  $run_composer_install = false,
  $tideways = false,
  $redis = false,
  $letsencrypt = false,
  $documentation_host = false,
) {
  if $params {
    include ::labeling_api::params
  }

  if $mysql {
    include ::labeling_api::mysql
  }

  if $couch {
    include ::labeling_api::couch
  }

  if $worker_queue {
    include ::labeling_api::worker_queue
  }

  if $redis {
    include ::labeling_api::redis
  }

  if $app {
    include ::labeling_api::cdn
    include ::labeling_api::app
    include ::labeling_api::worker
  }

  if $run_composer_install {
    include ::annostation_base::vagrant_composer_install
  }

  if $tideways {
    include ::tideways
  }

  if $letsencrypt {
    include ::letsencrypt
    include ::annostation_letsencrypt
  }

  if $documentation_host {
    include ::labeling_api::documentation_host
  }
}
