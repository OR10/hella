module "mysql" {
    source = "./modules/server"
    server_type = "mysql"
    count = 1
    ipv4_address = ""
    user_data = "${template_file.user_data.rendered}"
}

module "couch" {
    source = "./modules/server"
    server_type = "couch"
    count = 1
    ipv4_address = ""
    user_data = "${template_file.user_data.rendered}"
}

module "workerqueue" {
    source = "./modules/server"
    server_type = "workerqueue"
    count = 1
    ipv4_address = ""
    user_data = "${template_file.user_data.rendered}"
}

module "app" {
    source = "./modules/server"
    server_type = "app"
    count = 1
    ipv4_address = ""
    user_data = "${template_file.user_data.rendered}"
}

resource "null_resource" "provisioning" {
    provisioner "remote-exec" {
        inline = [
            "echo '${module.app.ipv4_address} app' >> /etc/hosts",
        ]
        connection {
            host = "${module.mysql.ipv4_address}"
        }
    }

    provisioner "remote-exec" {
        inline = [
            "echo '${module.mysql.ipv4_address} mysql' >> /etc/hosts",
            "echo '${module.couch.ipv4_address} couch' >> /etc/hosts",
            "echo '${module.workerqueue.ipv4_address} workerqueue' >> /etc/hosts",
        ]
        connection {
            host = "${module.app.ipv4_address}"
        }
    }

    provisioner "local-exec" {
        command = "cd ../../labeling-api/ && CAP_DEPLOY_IP=${module.app.ipv4_address} cap multi-staging-machine deploy"
        connection {
            host = "${module.app.ipv4_address}"
        }
    }

    provisioner "local-exec" {
        command = "cd ../../labeling-ui/ && ./deploy.sh ${module.app.ipv4_address}"
        connection {
            host = "${module.app.ipv4_address}"
        }
    }

    provisioner "remote-exec" {
        inline = [
            "cd /var/www/labeling-api/current",
            "app/console annostation:init --env=prod",
        ]
        connection {
            host = "${module.app.ipv4_address}"
        }
    }
}
