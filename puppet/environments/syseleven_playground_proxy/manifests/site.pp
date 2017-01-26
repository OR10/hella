Class['apt::update'] -> Package<| title != 'apt-transport-https' and title != 'ca-certificates' |>

include ::apt
include ::annostation_base
include ::annostation_letsencrypt
include ::annostation_proxy
