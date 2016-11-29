resource "openstack_compute_floatingip_v2" "labeltool" {
    pool = "Public_Internet"
}

resource "openstack_compute_instance_v2" "labeltool" {
    count = "1"

    name = "labeltool.annostation"
    network {
        name = "Private_HAGL"
    }
    image_name = "trusty-annostation-2"
    flavor_name = "anno.staging"
    floating_ip = "${openstack_compute_floatingip_v2.labeltool.address}"
    security_groups = ["default", "http", "${openstack_compute_secgroup_v2.frame-cdn.name}", "${openstack_compute_secgroup_v2.couchdb.name}", "${openstack_compute_secgroup_v2.rabbitmq.name}"]
    key_pair = "chh"

    user_data = "${template_file.user_data.rendered}"

    provisioner "file" {
        source = "puppet"
        destination = "/home/ubuntu/puppet"
    }

    provisioner "remote-exec" {
        script = "provision.sh"
    }

    provisioner "local-exec" {
        command = "cd ../../labeling-api/ && CAP_DEPLOY_IP=${openstack_compute_floatingip_v2.labeltool.address} cap labeling-api deploy"
        connection {
            host = "${openstack_compute_floatingip_v2.labeltool.address}"
        }
    }

    provisioner "local-exec" {
        command = "cd ../../labeling-ui/ # && ./deploy.sh ${openstack_compute_floatingip_v2.labeltool.address}"
        connection {
            host = "${openstack_compute_floatingip_v2.labeltool.address}"
        }
    }

    provisioner "remote-exec" {
        inline = [
            "cd /var/www/labeling-api/current",
            "sudo -u www-data ./app/console annostation:init --env=prod",
        ]
        connection {
            host = "${openstack_compute_floatingip_v2.labeltool.address}"
        }
    }
}
