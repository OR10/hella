# config valid only for current version of Capistrano
lock '3.4.0'

set :application, 'labeling-api'
set :repo_url, 'ssh://git@github.crosscan.com:AnnoStation/AnnoStation.git'

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, '/var/www/labeling-api'

# Default value for :scm is :git
# set :scm, :git
#set :scm, :gitcopy
set :scm, :copy

set :exclude_dir, ["puppet", "app/cache/prod", "app/cache/dev", "app/logs"]


# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
set :log_level, :info

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
# set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml')

# Default value for linked_dirs is []
# set :linked_dirs, fetch(:linked_dirs, []).push('log', 'tmp/pids', 'tmp/cache', 'tmp/sockets', 'vendor/bundle', 'public/system')

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

before :deploy, :local_composer_install
before 'deploy:publishing', :symlink_symfony_configuration
before 'deploy:published', :reload_php_fpm
before 'deploy:published', :restart_supervisord

#set :file_permissions_paths, ["app/logs", "app/cache"]
#set :file_permissions_users, ["www-data"]


task :local_composer_install do
  system("composer install --no-scripts --optimize-autoloader")
end

task :symlink_symfony_configuration do
  on roles(:app) do
    execute "cd '#{release_path}'; mkdir -p app/cache/prod"
    execute "cd '#{release_path}'; mkdir -p app/logs"
    execute "cd '#{release_path}'; ln -snf /etc/AnnoStation/labeling-api/parameters.yml app/config/parameters.yml"
    execute "cd '#{release_path}'; sudo chown -R www-data app/cache/"
    execute "cd '#{release_path}'; sudo chown -R www-data app/logs/"
    execute "cd '#{release_path}'; sudo -u www-data ./app/console --env=prod cache:clear"
    execute "cd '#{release_path}'; sudo -u www-data ./app/console --env=prod annostation:rabbitmq:setup"
  end
end

task :reload_php_fpm do
  on roles(:app) do
    execute "sudo service php5-fpm reload"
  end
end

task :restart_supervisord do
  on roles(:worker) do
    execute "sudo service supervisord restart"
  end
end

namespace :deploy do


  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      # Here we can do anything such as:
      # within release_path do
      #   execute :rake, 'cache:clear'
      # end
    end
  end

end
