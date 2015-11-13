Class['apt::update'] -> Package<| title != 'apt-transport-https' and title != 'ca-certificates' |>

include ::apt
include ::annostation_base

node mysql.vagrant {
    include ::labeling_api::mysql
}

node couch.vagrant {
    include ::labeling_api::couch
}

node cdn.vagrant {
    include ::labeling_api::cdn
}

node workerqueue.vagrant {
    include ::labeling_api::worker_queue
}

node app.vagrant {
    include ::annostation_base::nodejs
    include ::labeling_api::app_parameters
    include ::labeling_api::app
}

node worker.vagrant {
    include ::labeling_api::app_parameters
    include ::labeling_api::worker
}

node vagrant {
    include ::annostation_base::nodejs
    include ::labeling_api::mysql
    include ::labeling_api::couch
    include ::labeling_api::cdn
    include ::labeling_api::app_parameters
    include ::labeling_api::app
    include ::labeling_api::worker
}
