class { 'apt':
  update => {
    frequency => 'always',
  },
}

include php
ensure_packages(["software-properties-common"])
