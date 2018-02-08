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


#### Medium priority
* cron <%= @_couchdb_url_hotstandby %>

#### Low priority
* base nginx adn php and other images
* RUN set -x for console output
* containers optimization
* REMOVE DEPRECATED PROVISIONING
* XDebug configuration
* couchdb replication ?
* gzip static files
* phpunit fix
* For updating php up to 7.2 first update Guzzle
* Check --configure params for ffmpeg


#Subtasks

* \+ Containers configuration for API and maintenance
* \+ Containers configuration for video processing 
* Building
* Deployment
* Optimization
 

#Questions

* Build (secure parameters)
* How to deploy containers by swarm
* How to works queue (workers pool abstraction)? 
* configuration management / credentials
* move data from 1.5 to 1.7

