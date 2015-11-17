class labeling_api(
  $mysql = false,
  $couch = false,
  $worker_queue = false,
  $app = false,
  $run_composer_install = false,
) {
  include ::labeling_api::params

  if $mysql {
    include ::labeling_api::mysql
  }

  if $couch {
    include ::labeling_api::couch
  }

  if $worker_queue {
    include ::labeling_api::worker_queue
  }

  if $app {
    include ::labeling_api::cdn
    include ::labeling_api::app
    include ::labeling_api::worker
  }

  if $run_composer_install {
    include ::labeling_api::vagrant_composer_install
  }
}
