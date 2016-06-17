resource "openstack_compute_secgroup_v2" "frame-cdn" {
    name = "anno.frame_cdn"
    description = "Annostation Frame CDN"

    rule {
        from_port = 81
        to_port = 81
        ip_protocol = "tcp"
        cidr = "0.0.0.0/0"
    }
}
