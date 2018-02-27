server {
    listen 80;
    server_name _;

    client_max_body_size 512M;

    access_log /dev/stdout combined;
    error_log  /dev/stdout debug;

    rewrite_log on;

    location /labeling {
        root /code;
        index index.html;
        try_files $uri /labeling/index.html;
    }
}
