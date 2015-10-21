variable "count" {
  default = 1
}

resource "template_file" "user_data" {
    filename = "user_data.tpl"
}


resource "openstack_compute_instance_v2" "app-server" {
  count = "${var.count}"

  name = "app-server-${count.index}"
  image_name = "trusty"
  flavor_name = "m1.small"
  key_pair = "cho"
  security_groups = ["default"]

  user_data = "${template_file.user_data.rendered}"

  metadata {
    manage_etc_hosts = true
  }


  provisioner "file" {
      source = "../../labeling-api/puppet"
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

