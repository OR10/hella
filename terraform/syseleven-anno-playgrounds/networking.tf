# Playground 1,5

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

# Playground 2

resource "openstack_networking_network_v2" "anno-demo2" {
    name = "anno-demo2"
    admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "anno-demo2" {
    name = "anno-demo"
    network_id = "${openstack_networking_network_v2.anno-demo2.id}"
    cidr = "192.168.36.0/24"
    ip_version = 4
}

resource "openstack_networking_router_v2" "anno-demo2" {
    name = "anno-demo"
    external_gateway = "caf8de33-1059-4473-a2c1-2a62d12294fa"
}

resource "openstack_networking_router_interface_v2" "anno-demo2" {
    router_id = "${openstack_networking_router_v2.anno-demo2.id}"
    subnet_id = "${openstack_networking_subnet_v2.anno-demo2.id}"
}

# Playground 3

resource "openstack_networking_network_v2" "anno-demo3" {
    name = "anno-demo3"
    admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "anno-demo3" {
    name = "anno-demo3"
    network_id = "${openstack_networking_network_v2.anno-demo3.id}"
    cidr = "192.168.37.0/24"
    ip_version = 4
}

resource "openstack_networking_router_v2" "anno-demo3" {
    name = "anno-demo3"
    external_gateway = "caf8de33-1059-4473-a2c1-2a62d12294fa"
}

resource "openstack_networking_router_interface_v2" "anno-demo3" {
    router_id = "${openstack_networking_router_v2.anno-demo3.id}"
    subnet_id = "${openstack_networking_subnet_v2.anno-demo3.id}"
}

# Playground 4

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
