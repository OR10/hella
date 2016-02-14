variable "count" {
  default = 1
}

resource "template_file" "user_data" {
    filename = "user_data.tpl"
}

resource "openstack_compute_instance_v2" "app-server" {
  count = "${var.count}"

  name = "audi-dv-app-server-${count.index}"
  network {
    name = "external_network"
    fixed_ip_v4 = "192.168.217.214"
  }
  image_name = "trusty-annostation"
  flavor_name = "m1.large"
  security_groups = ["default"]

  user_data = "${template_file.user_data.rendered}"

  metadata {
    manage_etc_hosts = true
  }

  provisioner "file" {
      source = "puppet"
      destination = "/root/puppet"
  }

  provisioner "remote-exec" {
      script = "provision.sh"
  }

  provisioner "local-exec" {
      command = "cd ../../audi-dv-api/ && CAP_DEPLOY_IP=${openstack_compute_instance_v2.app-server.access_ip_v4} cap staging deploy"
  }

  provisioner "local-exec" {
      command = "cd ../../audi-dv-ui/Distribution/ && CAP_DEPLOY_IP=${openstack_compute_instance_v2.app-server.access_ip_v4} cap staging deploy"
  }
}
