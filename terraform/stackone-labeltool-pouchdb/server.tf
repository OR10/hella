resource "openstack_compute_floatingip_v2" "labeltool-pouchdb" {
    pool = "Public_Internet"
}

resource "openstack_compute_instance_v2" "labeltool-pouchdb" {
    count = "1"

    name = "labeltool-pouchdb.annostation"
    network {
        name = "Private_HAGL"
    }
    image_name = "trusty-annostation-2"
    flavor_name = "m1.medium"
    floating_ip = "${openstack_compute_floatingip_v2.labeltool-pouchdb.address}"
    security_groups = ["default", "http", "${openstack_compute_secgroup_v2.anno-pouchdb.name}"]
    key_pair = "chh"

    user_data = "${data.template_file.user_data.rendered}"

    provisioner "file" {
        source = "puppet"
        destination = "/home/ubuntu/puppet"
    }

    provisioner "remote-exec" {
        script = "provision.sh"
    }
}
