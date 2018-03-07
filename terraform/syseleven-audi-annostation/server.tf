resource "openstack_compute_floatingip_v2" "labeltool-audi" {
    count = "1"

    pool = "ext-net"
}

#resource "openstack_compute_instance_v2" "labeltool-audi" {
#    count = "1"
#
#    name = "labeltool-audi.labeltool"
#    image_id = "d82d843b-bcb5-41d2-b545-a0937c3796ad"
#    flavor_name = "m1.medium"
#    key_pair = "${openstack_compute_keypair_v2.crosscan-cht.name}"
#    stop_before_destroy = false
#
#    security_groups = [
#        "default",
#        "${openstack_compute_secgroup_v2.SSH-audi.name}",
#        "${openstack_compute_secgroup_v2.labeltool-audi.name}",
#    ]
#
#    floating_ip = "${openstack_compute_floatingip_v2.labeltool-audi.address}"
#
#    network {
#        name = "labeltool-audi"
#    }
#
#    provisioner "file" {
#        source = "puppet"
#        destination = "/home/ubuntu/puppet"
#
#        connection {
#            host = "${openstack_compute_floatingip_v2.labeltool-audi.address}"
#            user = "ubuntu"
#        }
#    }
#
#    provisioner "remote-exec" {
#        script = "provision.sh"
#
#        connection {
#            host = "${openstack_compute_floatingip_v2.labeltool-audi.address}"
#            user = "ubuntu"
#        }
#    }
#}
