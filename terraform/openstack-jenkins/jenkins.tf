resource "openstack_compute_instance_v2" "jenkins" {
  count = 2

  name = "annostation-ci-slave-3-${count.index}"
  #image_name = "trusty"
  image_name = "trusty-jenkins"
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

