resource "openstack_networking_network_v2" "anno-demo" {
    name = "anno-demo"
    admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "anno-demo" {
    name = "anno-demo"
    network_id = "${openstack_networking_network_v2.anno-demo.id}"
    cidr = "192.168.35.0/24"
    ip_version = 4
}

resource "openstack_networking_router_v2" "anno-demo" {
    name = "anno-demo"
    external_gateway = "caf8de33-1059-4473-a2c1-2a62d12294fa"
}

resource "openstack_networking_router_interface_v2" "anno-demo" {
    router_id = "${openstack_networking_router_v2.anno-demo.id}"
    subnet_id = "${openstack_networking_subnet_v2.anno-demo.id}"
}
