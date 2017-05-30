# maybe we don't want to allow direct ssh access in the future and use an ssh
# jump host instead or we don't assign this security group to the compute
# instances but instead assign it manually on purpose - we will see
resource "openstack_compute_secgroup_v2" "SSH" {
    name = "SSH"
    description = "Allow incoming SSH access"

    rule {
        from_port = 22
        to_port = 22
        ip_protocol = "tcp"
        cidr = "0.0.0.0/0"
    }
}


resource "openstack_compute_secgroup_v2" "labeltool-app" {
    name = "labeltool-app"
    description = "Allow incoming connections for the labeltool app server"

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

    rule {
        from_port = 8
        to_port = 0
        ip_protocol = "icmp"
        cidr = "0.0.0.0/0"
    }
}
