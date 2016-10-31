resource "openstack_compute_floatingip_v2" "anno-demo2" {
    pool = "ext-net"
}
