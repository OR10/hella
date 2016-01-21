resource "openstack_compute_instance_v2" "jenkins" {
  count = 2

  name = "annostation-ci-slave-${count.index}"
  #image_name = "trusty"
  image_name = "trusty-jenkins"
  image_id = "9216d04d-666f-499c-b15e-e9ef34627587"
  flavor_name = "m1.small"
  key_pair = "chh"
  security_groups = ["default"]
  user_data = "${template_file.user_data.rendered}"

  lifecycle {
    create_before_destroy = true
  }

  metadata {
    manage_etc_hosts = true
  }

  provisioner "file" {
      source = "puppet"
      destination = "/home/ubuntu/puppet"
      connection {
          user = "ubuntu"
      }
  }

  provisioner "remote-exec" {
      script = "provision.sh"
      connection {
          user = "ubuntu"
      }
  }
}
