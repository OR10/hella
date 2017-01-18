resource "openstack_networking_network_v2" "anno-demo4" {
    name = "anno-demo4"
    admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "anno-demo4" {
    name = "anno-demo4"
    network_id = "${openstack_networking_network_v2.anno-demo4.id}"
    cidr = "192.168.38.0/24"
    ip_version = 4
}

resource "openstack_networking_router_v2" "anno-demo4" {
    name = "anno-demo4"
    external_gateway = "caf8de33-1059-4473-a2c1-2a62d12294fa"
}

resource "openstack_networking_router_interface_v2" "anno-demo4" {
    router_id = "${openstack_networking_router_v2.anno-demo4.id}"
    subnet_id = "${openstack_networking_subnet_v2.anno-demo4.id}"
}
