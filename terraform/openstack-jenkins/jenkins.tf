resource "openstack_compute_instance_v2" "jenkins" {
  count = 1

  name = "annostation-ci-slave-${count.index}"
  #image_name = "trusty"
  image_name = "trusty-jenkins"
  flavor_name = "m1.small"
  key_pair = "cho"
  security_groups = ["default"]
  user_data = "${template_file.user_data.rendered}"

  metadata {
    manage_etc_hosts = true
  }


  provisioner "file" {
      source = "/Users/hco/src/AnnoStation/labeling-api/puppet"
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

