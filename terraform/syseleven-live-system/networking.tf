resource "openstack_networking_network_v2" "live" {
    name = "live"
    admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "live" {
    name = "labeltool"
    network_id = "${openstack_networking_network_v2.live.id}"
    cidr = "192.168.50.0/24"
    ip_version = 4
    enable_dhcp = false
}

resource "openstack_networking_router_v2" "live" {
    name = "live"
    external_gateway = "caf8de33-1059-4473-a2c1-2a62d12294fa"
}

resource "openstack_networking_router_interface_v2" "live" {
    router_id = "${openstack_networking_router_v2.live.id}"
    subnet_id = "${openstack_networking_subnet_v2.live.id}"
}
