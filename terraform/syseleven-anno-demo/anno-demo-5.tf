resource "openstack_compute_instance_v2" "anno-demo-5" {
    name = "anno-demo-5"
    image_name = "Ubuntu 14.04 sys11-cloudimg amd64"
    flavor_name = "m1.micro"
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
            host = "${openstack_compute_instance_v2.anno-demo-5.access_ip_v4}"
            user = "ubuntu"
        }
    }

    provisioner "file" {
        source = "provision.sh"
        destination = "/home/ubuntu/provision.sh"

        connection {
            bastion_host = "${openstack_compute_floatingip_v2.anno-demo.address}"
            bastion_user = "ubuntu"
            host = "${openstack_compute_instance_v2.anno-demo-5.access_ip_v4}"
            user = "ubuntu"
        }
    }

    provisioner "remote-exec" {
        inline = [
            "chmod +x /home/ubuntu/provision.sh",
            "/home/ubuntu/provision.sh syseleven_anno_demo5"
        ]

        connection {
            bastion_host = "${openstack_compute_floatingip_v2.anno-demo.address}"
            bastion_user = "ubuntu"
            host = "${openstack_compute_instance_v2.anno-demo-5.access_ip_v4}"
            user = "ubuntu"
        }
    }
}
