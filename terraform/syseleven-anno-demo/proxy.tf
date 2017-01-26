resource "openstack_compute_floatingip_v2" "anno-demo" {
    pool = "ext-net"
}

resource "openstack_compute_instance_v2" "playground-proxy" {
    name = "playground-proxy"
    image_name = "Ubuntu 14.04 sys11-cloudimg amd64"
    flavor_name = "m1.micro"
    key_pair = "${openstack_compute_keypair_v2.crosscan-chh.name}"

    security_groups = [
        "default",
        "${openstack_compute_secgroup_v2.anno-demo-app.name}",
    ]

    floating_ip = "${openstack_compute_floatingip_v2.anno-demo.address}"

    network {
        name = "anno-demo"
    }

    provisioner "file" {
        source = "puppet"
        destination = "/home/ubuntu/puppet"

        connection {
            host = "${openstack_compute_floatingip_v2.anno-demo.address}"
            user = "ubuntu"
        }
    }

    provisioner "remote-exec" {
        script = "provision-proxy.sh"

        connection {
            host = "${openstack_compute_floatingip_v2.anno-demo.address}"
            user = "ubuntu"
        }
    }
}
