server {
    listen 80;
    server_name _;

    client_max_body_size 512M;

    access_log            /var/log/nginx/default.access.log combined;
    error_log             /var/log/nginx/default.error.log debug;

    rewrite_log on;

    location /s3 {
        proxy_pass       https://s3.eu-central-1.amazonaws.com/hella-frame-cdn;
        #    proxy_set_header Host      $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    #location /couch/ {
    #    proxy_pass       http://127.0.0.1:5984/;
    #    proxy_set_header X-Real-IP $remote_addr;
    #}

    ######## FE Angular start ########
    location /labeling {
        rewrite_log on;
        proxy_pass http://front/labeling;
    }
    ######## FE Angular end ########

    ######## API monolith start ########
    location / {
        rewrite_log on;
        proxy_pass http://api_nginx/;
    }

    location _profiler {
        rewrite_log on;
        proxy_pass http://api_nginx/;
    }

    location /api {
        rewrite_log on;
        proxy_pass http://api_nginx/api;
    }
    ######## API monolith end ########
}
