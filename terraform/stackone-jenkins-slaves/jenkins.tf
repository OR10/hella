variable "count" {
  default = 3
}

resource "openstack_compute_secgroup_v2" "jenkins-slaves" {
  name = "jenkins-slaves"
  description = "security group for jenkins slaves"

  rule {
    from_port = 9876
    to_port = 9876
    ip_protocol = "tcp"
    cidr = "0.0.0.0/0"
  }

  rule {
    from_port = 52343
    to_port = 52343
    ip_protocol = "tcp"
    cidr = "0.0.0.0/0"
  }

  rule {
    from_port = 54323
    to_port = 54323
    ip_protocol = "tcp"
    cidr = "0.0.0.0/0"
  }

  rule {
    from_port = 54346
    to_port = 54346
    ip_protocol = "tcp"
    cidr = "0.0.0.0/0"
  }
}

resource "openstack_compute_floatingip_v2" "jenkins-slave" {
  pool = "Public_Internet"
  count = "${var.count}"

  lifecycle {
    create_before_destroy = true
  }
}

resource "openstack_compute_instance_v2" "jenkins-slave" {
  name = "annostation-ci-slave-${count.index}"
  count = "${var.count}"

  image_name = "trusty-annostation-2"

  flavor_name = "anno.ci-slave"
  key_pair = "chh"
  user_data = "${template_file.user_data.rendered}"
  floating_ip = "${element(openstack_compute_floatingip_v2.jenkins-slave.*.address, count.index)}"

  security_groups = ["default", "${openstack_compute_secgroup_v2.jenkins-slaves.name}"]

  lifecycle {
    create_before_destroy = true
  }

  network {
    name = "Private_HAGL"
  }

  provisioner "file" {
      source = "puppet"
      destination = "/home/ubuntu/puppet"
  }

  provisioner "remote-exec" {
      script = "provision.sh"
  }
}
