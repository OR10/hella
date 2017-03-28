resource "openstack_compute_floatingip_v2" "development" {
    pool = "ext-net"
}

resource "openstack_compute_instance_v2" "development" {
    name = "development"
    image_name = "Ubuntu 14.04 sys11-cloudimg amd64-20161101-0857"
    flavor_name = "m1.tiny"
    key_pair = "crosscan-chh"
    stop_before_destroy = false

    security_groups = [
        "default",
        "${openstack_compute_secgroup_v2.development.name}",
    ]

    floating_ip = "${openstack_compute_floatingip_v2.development.address}"

    network {
        name = "development"
    }
}
