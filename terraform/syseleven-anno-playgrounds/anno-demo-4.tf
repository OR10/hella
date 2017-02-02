resource "openstack_compute_floatingip_v2" "anno-demo4" {
    pool = "ext-net"
}

resource "openstack_compute_instance_v2" "anno-demo4" {
    name = "anno-demo4"
    image_name = "Ubuntu 14.04 sys11-cloudimg amd64"
    flavor_name = "m1.micro"
    key_pair = "crosscan-chh"

    security_groups = [
        "default",
        "${openstack_compute_secgroup_v2.anno-demo4-app.name}",
    ]

    floating_ip = "${openstack_compute_floatingip_v2.anno-demo4.address}"

    network {
        name = "anno-demo4"
    }

    provisioner "file" {
        source = "puppet"
        destination = "/home/ubuntu/puppet"

        connection {
            host = "${openstack_compute_floatingip_v2.anno-demo4.address}"
            user = "ubuntu"
        }
    }

    provisioner "file" {
        source = "provision.sh"
        destination = "/home/ubuntu/provision.sh"

        connection {
            host = "${openstack_compute_floatingip_v2.anno-demo4.address}"
            user = "ubuntu"
        }
    }

    provisioner "remote-exec" {
        inline = [
            "chmod +x /home/ubuntu/provision.sh",
            "/home/ubuntu/provision.sh syseleven_anno_demo4"
        ]

        connection {
            host = "${openstack_compute_floatingip_v2.anno-demo4.address}"
            user = "ubuntu"
        }
    }
}
