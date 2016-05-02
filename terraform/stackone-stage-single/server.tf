resource "openstack_compute_floatingip_v2" "pakistan" {
    pool = "Public_Internet"
}

resource "openstack_compute_instance_v2" "pakistan" {
    count = "1"

    name = "pakistan.annostation"
    network {
        name = "Private_HAGL"
    }
    image_name = "trusty-annostation-2"
    flavor_name = "anno.storage"
    floating_ip = "${openstack_compute_floatingip_v2.pakistan.address}"
    security_groups = ["default", "http", "anno_frame_cdn"]
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
        command = "cd ../../labeling-api/ && CAP_DEPLOY_IP=${openstack_compute_floatingip_v2.pakistan.address} cap multi-staging-machine deploy"
        connection {
            host = "${openstack_compute_floatingip_v2.pakistan.address}"
        }
    }

    provisioner "local-exec" {
        command = "cd ../../labeling-ui/ # && ./deploy.sh ${openstack_compute_floatingip_v2.pakistan.address}"
        connection {
            host = "${openstack_compute_floatingip_v2.pakistan.address}"
        }
    }

    provisioner "remote-exec" {
        inline = [
            "cd /var/www/labeling-api/current",
            "sudo -u www-data ./app/console annostation:init --env=prod",
        ]
        connection {
            host = "${openstack_compute_floatingip_v2.pakistan.address}"
        }
    }
}
