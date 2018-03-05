server {
    listen 80;
    server_name _;

    client_max_body_size 512M;

    index  app.php;

    access_log /dev/stdout combined;
    error_log  /dev/stdout debug;

    rewrite_log on;

    location ~* ".*\.(css|js|txt|jpg|png|ico)$" {
        root      /code;
    }

    location / {
        root      /code/web/AnnoStation;
        index     app.php;
        try_files $uri  /app.php$is_args$args;
    }

    location ~ \.php(/|$) {
        root          /code/web/AnnoStation;
        include       /etc/nginx/fastcgi_params;

        fastcgi_pass  api-fpm:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_read_timeout 3600;
        rewrite_log on;
    }

    location /api {
        root          /code/web/AnnoStation;
        include       /etc/nginx/fastcgi_params;

        fastcgi_pass  api-fpm:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_read_timeout 3600;

        rewrite /api/v(\d+)/ /app.php?version=v$1&;
        rewrite_log on;
    }
}
