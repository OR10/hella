resource "openstack_compute_secgroup_v2" "frame_cdn" {
    name = "anno_frame_cdn"
    description = "Annostation Frame CDN"

    rule {
        from_port = 81
        to_port = 81
        ip_protocol = "tcp"
        cidr = "0.0.0.0/0"
    }
}
