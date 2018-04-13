server {
    listen 80;
    server_name _;

    client_max_body_size 512M;

    access_log /dev/stdout combined;
    error_log  /dev/stdout debug;

    rewrite_log on;

    location /s3 {
        add_header 'Access-Control-Allow-Origin' "$http_origin" always;
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'x-requested-with, Content-Type, origin, authorization, accept, client-security-token' always;
        add_header 'Access-Control-Max-Age' '1728000' always;

        if ($request_method = OPTIONS) {
            add_header Content-Length 0;
            add_header Content-Type text/plain;

            return 204;
        }

        proxy_pass       https://s3.eu-central-1.amazonaws.com/hella-frame-cdn;
        #    proxy_set_header Host      $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /azure {
        add_header 'Access-Control-Allow-Origin' "$http_origin" always;
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'x-requested-with, Content-Type, origin, authorization, accept, client-security-token' always;
        add_header 'Access-Control-Max-Age' '1728000' always;

        if ($request_method = OPTIONS) {
            add_header Content-Length 0;
            add_header Content-Type text/plain;

            return 204;
        }

        proxy_pass       https://helladev.blob.core.cloudapi.de/hella-frame-cdn;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /couch/ {
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'x-requested-with, Content-Type, origin, authorization, accept, client-security-token' always;
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;
        add_header 'Access-Control-Allow-Origin' "$http_origin" always;
        add_header 'Access-Control-Max-Age' '1728000' always;

        if ($request_method = OPTIONS) {
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Headers' 'x-requested-with, Content-Type, origin, authorization, accept, client-security-token' always;
            add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;
            add_header 'Access-Control-Allow-Origin' "$http_origin" always;
            add_header 'Access-Control-Max-Age' '1728000' always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;

            return 204;
        }

        proxy_pass       http://api-couchdb:5984/;
        proxy_set_header X-Real-IP $remote_addr;
    }

    ######## FE Angular start ########
    location /labeling {
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'x-requested-with, Content-Type, origin, authorization, accept, client-security-token' always;
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;
        add_header 'Access-Control-Allow-Origin' "$http_origin" always;
        add_header 'Access-Control-Max-Age' '1728000' always;

        if ($request_method = OPTIONS) {
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Headers' 'x-requested-with, Content-Type, origin, authorization, accept, client-security-token' always;
            add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;
            add_header 'Access-Control-Allow-Origin' "$http_origin" always;
            add_header 'Access-Control-Max-Age' '1728000' always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;

            return 204;
        }

        rewrite_log on;
        proxy_pass http://front/labeling;
    }
    ######## FE Angular end ########

    ######## API monolith start ########
    location / {
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'x-requested-with, Content-Type, origin, authorization, accept, client-security-token' always;
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;
        add_header 'Access-Control-Allow-Origin' "$http_origin" always;
        add_header 'Access-Control-Max-Age' '1728000' always;

        if ($request_method = OPTIONS) {
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Headers' 'x-requested-with, Content-Type, origin, authorization, accept, client-security-token' always;
            add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;
            add_header 'Access-Control-Allow-Origin' "$http_origin" always;
            add_header 'Access-Control-Max-Age' '1728000' always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;

            return 204;
        }

        rewrite_log on;
        proxy_pass http://api-nginx/;
    }

    location _profiler {
        rewrite_log on;
        proxy_pass http://api-nginx/;
    }

    location /api {
        add_header 'Access-Control-Allow-Origin' "$http_origin" always;
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;
        add_header 'Access-Control-Max-Age' '1728000' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'x-requested-with, Content-Type, origin, authorization, accept, client-security-token' always;

        if ($request_method = OPTIONS) {
            add_header Content-Length 0;
            add_header Content-Type text/plain;

            return 204;
        }

        rewrite_log on;
        proxy_pass http://api-nginx/api;
    }
    ######## API monolith end ########

    ######## Documentation begin ########
    location /swagger/api/ {
        proxy_pass       http://doc-go-swagger:80/;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /swagger/ui/ {
        proxy_pass       http://doc-swagger-ui:8080/;
        proxy_set_header X-Real-IP $remote_addr;
    }
    ######## Documentation end ########
}
