server {
    listen 80;
    server_name _;

    client_max_body_size 512M;

    access_log            /var/log/nginx/default.access.log combined;
    error_log             /var/log/nginx/default.error.log debug;

    root /code/web;

    location / {
        # try to serve file directly, fallback to front controller
        try_files $uri /index.php$is_args$args;
    }

    # If you have 2 front controllers for dev|prod use the following line instead
    location ~ ^/(index|index_dev)\.php(/|$) {
    #location ~ ^/index\.php(/|$) {
        fastcgi_pass  video_fpm:9000;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param HTTPS off;
        fastcgi_read_timeout 3600;
    }

    #return 404 for all php files as we do have a front controller
    location ~ \.php$ {
        return 404;
    }
}
