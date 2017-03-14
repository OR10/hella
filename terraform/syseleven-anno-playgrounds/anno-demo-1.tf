resource "openstack_compute_instance_v2" "anno-demo" {
    name = "anno-demo"
    image_id = "39d64de3-c562-4a80-b968-ab46a6838cf4"
    flavor_name = "m1.small"
    key_pair = "${openstack_compute_keypair_v2.crosscan-chh.name}"

    security_groups = [
        "default",
        "${openstack_compute_secgroup_v2.anno-demo-app.name}",
    ]

    network {
        name = "anno-demo"
    }

    provisioner "file" {
        source = "puppet"
        destination = "/home/ubuntu/puppet"

        connection {
            bastion_host = "${openstack_compute_floatingip_v2.anno-demo.address}"
            bastion_user = "ubuntu"
            host = "${openstack_compute_instance_v2.anno-demo.access_ip_v4}"
            user = "ubuntu"
        }
    }

    provisioner "file" {
        source = "provision.sh"
        destination = "/home/ubuntu/provision.sh"

        connection {
            bastion_host = "${openstack_compute_floatingip_v2.anno-demo.address}"
            bastion_user = "ubuntu"
            host = "${openstack_compute_instance_v2.anno-demo.access_ip_v4}"
            user = "ubuntu"
        }
    }

    provisioner "remote-exec" {
        inline = [
            "chmod +x /home/ubuntu/provision.sh",
            "/home/ubuntu/provision.sh syseleven_anno_demo"
        ]

        connection {
            bastion_host = "${openstack_compute_floatingip_v2.anno-demo.address}"
            bastion_user = "ubuntu"
            host = "${openstack_compute_instance_v2.anno-demo.access_ip_v4}"
            user = "ubuntu"
        }
    }
}
