class labeling_api(
  $mysql = false,
  $couch = false,
  $worker_queue = false,
  $app = false,
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
}
