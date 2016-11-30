resource "openstack_compute_floatingip_v2" "proxy" {
    pool = "Public_Internet"
}

resource "openstack_compute_instance_v2" "proxy" {
    count = "1"

    name = "annostation-proxy"

    network {
        name = "Private_HAGL"
    }

    image_name = "trusty-annostation-2"
    flavor_name = "m1.small"
    floating_ip = "${openstack_compute_floatingip_v2.proxy.address}"
    security_groups = ["default", "http"]
    key_pair = "chh"

    user_data = "${data.template_file.user_data.rendered}"

    provisioner "file" {
        source = "puppet"
        destination = "/home/ubuntu/puppet"
    }

    provisioner "remote-exec" {
        script = "provision.sh"
    }
}
