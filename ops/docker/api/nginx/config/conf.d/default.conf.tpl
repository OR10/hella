server {
    listen 80;
    server_name _;

    client_max_body_size 512M;

    index  app_dev.php;

    access_log            /var/log/nginx/default.access.log combined;
    error_log             /var/log/nginx/default.error.log debug;

    rewrite_log on;

    location ~* ".*\.(css|js|txt|jpg|png|ico)$" {
        root      /code;
    }

    location / {
        root      /code/web/AnnoStation;
        index     app_dev.php;
        try_files $uri  /app_dev.php$is_args$args;
    }

    location ~ \.php(/|$) {
        root          /code/web/AnnoStation;
        include       /etc/nginx/fastcgi_params;

        fastcgi_pass  api_fpm:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_read_timeout 3600;
        rewrite_log on;
    }

    location /api {
        root          /code/web/AnnoStation;
        include       /etc/nginx/fastcgi_params;

        fastcgi_pass  api_fpm:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_read_timeout 3600;

        rewrite /api/v(\d+)/ /app_dev.php?version=v$1&;
        rewrite_log on;
    }
}
