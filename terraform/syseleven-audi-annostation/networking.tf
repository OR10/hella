resource "openstack_networking_network_v2" "labeltool-audi" {
    name = "labeltool-audi"
    admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "labeltool-audi" {
    name = "labeltool-audi"
    network_id = "${openstack_networking_network_v2.labeltool-audi.id}"
    cidr = "192.168.39.0/24"
    ip_version = 4
    enable_dhcp = false
}

resource "openstack_networking_router_v2" "labeltool-audi" {
    name = "labeltool-audi"
    external_gateway = "caf8de33-1059-4473-a2c1-2a62d12294fa"
}

resource "openstack_networking_router_interface_v2" "labeltool-audi" {
    router_id = "${openstack_networking_router_v2.labeltool-audi.id}"
    subnet_id = "${openstack_networking_subnet_v2.labeltool-audi.id}"
}
