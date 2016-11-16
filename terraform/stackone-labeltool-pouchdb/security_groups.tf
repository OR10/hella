resource "openstack_compute_secgroup_v2" "anno-pouchdb" {
    name = "anno-pouchdb"
    description = "Annostation PouchDB Staging"

    rule {
        from_port = 81
        to_port = 81
        ip_protocol = "tcp"
        cidr = "0.0.0.0/0"
    }

    rule {
        from_port = 5984
        to_port = 5984
        ip_protocol = "tcp"
        cidr = "0.0.0.0/0"
    }

    rule {
        from_port = 15672
        to_port = 15672
        ip_protocol = "tcp"
        cidr = "0.0.0.0/0"
    }
}
