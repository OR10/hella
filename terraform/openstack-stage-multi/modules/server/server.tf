resource "openstack_compute_instance_v2" "server" {
    count = "${var.count}"

    name = "${var.server_type}${count.index}.annostation"
    network {
        name = "external_network"
        fixed_ip_v4 = "${var.ipv4_address}"
    }
    image_name = "trusty-annostation"
    flavor_name = "${var.flavor}"
    security_groups = ["default"]

    user_data = "${template_file.user_data.rendered}"

    provisioner "file" {
        source = "puppet"
        destination = "/home/ubuntu/puppet"
    }

    provisioner "remote-exec" {
        script = "provision.sh"
    }
}

output "ipv4_address" {
    value = "${openstack_compute_instance_v2.server.access_ip_v4}"
}
