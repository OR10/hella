server {
    listen 80;
    server_name _;

    client_max_body_size 512M;

    access_log /var/log/nginx/default.access.log combined;
    error_log /var/log/nginx/default.error.log debug;

    rewrite_log on;

    location /labeling {
        root /code;
        index index.html;
        try_files $uri /labeling/index.html;
    }
}
