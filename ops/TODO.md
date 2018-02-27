#TODO

#### High priority
* \+ api service
* \+ use docker-compose instead of `supervisord`
* \+ nginx config (remove old lines)
* \+ video service
* \+ data volumes
* \+ health checks
* \+ separate FE and BE
* \+ ENV variables
* \+ use based on SYMFONY_ENV app.php instead of app_dev.php and app.php
* Video processing configuration

#### Medium priority
* \+ monitoring
* cron <%= @_couchdb_url_hotstandby %>
* logs (syslog + ELK)?
* migrations after deployment
* users and privilegies on controllers (how to run as host user)

#### Low priority
* base nginx and php and other images
* containers optimization
* \+ REMOVE DEPRECATED PROVISIONING
* XDebug configuration
* couchdb replication ?
* gzip static files
* phpunit fix
* For updating php up to 7.2 first update Guzzle
* Check --configure params for ffmpeg


#Subtasks

* \+ Containers configuration for API and maintenance
* \+ Containers configuration for video processing 
* \+ Building
* \+ Deployment
* Optimization
 

#Questions

* Build (secure parameters)
* \+ How to deploy containers by swarm
* \+- How to works queue (workers pool abstraction)? 
* configuration management / credentials
* move data from 1.5 to 1.7