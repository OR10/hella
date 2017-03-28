resource "openstack_networking_network_v2" "development" {
    name = "development"
    admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "development" {
    name = "development"
    network_id = "${openstack_networking_network_v2.development.id}"
    cidr = "192.168.40.0/24"
    ip_version = 4
    enable_dhcp = false
}

resource "openstack_networking_router_v2" "development" {
    name = "development"
    external_gateway = "caf8de33-1059-4473-a2c1-2a62d12294fa"
}

resource "openstack_networking_router_interface_v2" "development" {
    router_id = "${openstack_networking_router_v2.development.id}"
    subnet_id = "${openstack_networking_subnet_v2.development.id}"
}
