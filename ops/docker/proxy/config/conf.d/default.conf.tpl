server {
    listen 80;
    server_name _;

    client_max_body_size 512M;

    access_log /dev/stdout combined;
    error_log  /dev/stdout debug;

    rewrite_log on;

    location /s3 {
        proxy_pass       https://s3.eu-central-1.amazonaws.com/hella-frame-cdn;
        #    proxy_set_header Host      $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /couch/ {
        proxy_pass       http://api-couchdb:5984/;
        proxy_set_header X-Real-IP $remote_addr;
    }

    ######## FE Angular start ########
    location /labeling {
        rewrite_log on;
        proxy_pass http://front/labeling;
    }
    ######## FE Angular end ########

    ######## API monolith start ########
    location / {
        rewrite_log on;
        proxy_pass http://api-nginx/;
    }

    location _profiler {
        rewrite_log on;
        proxy_pass http://api-nginx/;
    }

    location /api {
        rewrite_log on;
        proxy_pass http://api-nginx/api;
    }
    ######## API monolith end ########
}
