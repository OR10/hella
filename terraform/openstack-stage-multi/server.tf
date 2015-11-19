module "mysql" {
    source = "./modules/server"
    server_type = "mysql"
    count = 1
    ipv4_address = "192.168.217.220"
}

module "couch" {
    source = "./modules/server"
    server_type = "couch"
    count = 1
    ipv4_address = "192.168.217.221"
}

module "workerqueue" {
    source = "./modules/server"
    server_type = "workerqueue"
    count = 1
    ipv4_address = "192.168.217.222"
}

module "app" {
    source = "./modules/server"
    server_type = "app"
    count = 1
    ipv4_address = "192.168.217.223"
}

resource "null_resource" "provisioning" {
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
            "if [ -d /var/www/labeling-api/current ]; then",
            "cd /var/www/labeling-api/current",
            "app/console annostation:init --env=prod",
            "fi",
        ]
        connection {
            host = "${module.app.ipv4_address}"
        }
    }
}
