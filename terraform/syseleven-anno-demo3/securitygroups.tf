resource "openstack_compute_secgroup_v2" "anno-demo3-app" {
    name = "anno-demo3-app"
    description = "Allow incoming connections for the anno-demo3 app server"

    rule {
        from_port = 22
        to_port = 22
        ip_protocol = "tcp"
        cidr = "0.0.0.0/0"
    }

    rule {
        from_port = 80
        to_port = 80
        ip_protocol = "tcp"
        cidr = "0.0.0.0/0"
    }

    rule {
        from_port = 443
        to_port = 443
        ip_protocol = "tcp"
        cidr = "0.0.0.0/0"
    }

    rule {
        from_port = 81
        to_port = 81
        ip_protocol = "tcp"
        cidr = "0.0.0.0/0"
    }
}
