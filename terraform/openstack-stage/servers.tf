variable "count" {
  default = 1
}

resource "template_file" "user_data" {
    filename = "user_data.tpl"
}


resource "openstack_compute_instance_v2" "app-server" {
  count = "${var.count}"

  name = "app-server-${count.index}"
  network {
    name = "external_network"
    fixed_ip_v4 = "192.168.217.213"
  }
  image_name = "trusty"
  flavor_name = "m1.small"
  key_pair = "cho"
  security_groups = ["default"]

  user_data = "${template_file.user_data.rendered}"

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

  provisioner "local-exec" {
      command = "cd ../../labeling-api/ && CAP_DEPLOY_IP=${openstack_compute_instance_v2.app-server.access_ip_v4} time cap single-staging-machine deploy"
  }

  provisioner "local-exec" {
      command = "cd ../../labeling-ui/ && ./deploy.sh ${openstack_compute_instance_v2.app-server.access_ip_v4}"
  }

}

