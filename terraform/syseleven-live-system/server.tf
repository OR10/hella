variable "app-count" {
  default = 1
}

variable "couchdb-count" {
  default = 2
}

variable "flavors" {
  type = "map"
  default = {
    "app-0.live" = "m1.small"
    "couchdb-0.live" = "m1.small"
    "couchdb-1.live" = "m1.tiny"
  }
}

resource "openstack_compute_floatingip_v2" "live" {
    count = "${var.app-count}"

    pool = "ext-net"
}

#resource "openstack_compute_instance_v2" "live" {
#    count = "${var.app-count}"

#    name = "app-${count.index}.live"
#    image_id = "93b03b4b-79cf-49d7-9025-1420f751523a"
#    flavor_name = "${var.flavors["app-${count.index}.live"]}"
#    key_pair = "crosscan-chh"
#    stop_before_destroy = false

#    security_groups = [
#        "default",
#        "${openstack_compute_secgroup_v2.live-app.name}",
#    ]

#    floating_ip = "${openstack_compute_floatingip_v2.live.address}"

#    network {
#        name = "live"
#    }

#    provisioner "file" {
#        source = "puppet"
#        destination = "/home/ubuntu/puppet"

#        connection {
#            host = "${openstack_compute_floatingip_v2.live.address}"
#            user = "ubuntu"
#        }
#    }

#    provisioner "remote-exec" {
#        script = "provision.sh"

#        connection {
#            host = "${openstack_compute_floatingip_v2.live.address}"
#            user = "ubuntu"
#        }
#    }
#}
#
#resource "openstack_compute_instance_v2" "live-couchdb" {
#    count = "${var.couchdb-count}"
#
#    name = "couchdb-${count.index}.live"
#    image_id = "93b03b4b-79cf-49d7-9025-1420f751523a"
#    flavor_name = "${var.flavors["couchdb-${count.index}.live"]}"
#    key_pair = "crosscan-chh"
#    stop_before_destroy = false
#
#    security_groups = [
#        "default",
#    ]
#
#    network {
#        name = "live"
#    }
#
#    provisioner "file" {
#        source = "puppet"
#        destination = "/home/ubuntu/puppet"
#
#        connection {
#            user = "ubuntu"
#            agent = "true"
#            bastion_host = "${openstack_compute_floatingip_v2.live.address}"
#        }
#    }
#
#    provisioner "remote-exec" {
#        script = "provision.sh"
#
#        connection {
#            user = "ubuntu"
#            agent = "true"
#            bastion_host = "${openstack_compute_floatingip_v2.live.address}"
#        }
#    }
#}
#
## clear couchdb hosts known to the app server
#resource "null_resource" "clear-couchdb-hosts" {
#    provisioner "remote-exec" {
#        inline = [
#            "sudo sed -i -r 's/.* couch[0-9]+$//' /etc/hosts",
#            "sudo sed -i -r 's/.* couch[0-9]+$//' /etc/cloud/templates/hosts.debian.tmpl",
#        ]
#    }
#
#    connection {
#        host = "${openstack_compute_floatingip_v2.live.address}"
#        user = "ubuntu"
#    }
#
#    triggers {
#        cluster_instance_ids = "${join(", ", openstack_compute_instance_v2.live.*.id)}, ${join(", ", openstack_compute_instance_v2.live-couchdb.*.id)}"
#    }
#}
#
## make couchdb hosts known to the app server
#resource "null_resource" "add-couchdb-hosts" {
#    count = "${var.couchdb-count}"
#
#    depends_on = ["null_resource.clear-couchdb-hosts"]
#
#    provisioner "remote-exec" {
#        inline = [
#            # add to current /etc/hosts so we don't have to reboot
#            "sudo sh -c 'echo \"${element(openstack_compute_instance_v2.live-couchdb.*.access_ip_v4, count.index)} couch-${count.index}\" >> /etc/hosts'",
#            # add to hosts template to make it persistent accross reboots
#            "sudo sh -c 'echo \"${element(openstack_compute_instance_v2.live-couchdb.*.access_ip_v4, count.index)} couch-${count.index}\" >> /etc/cloud/templates/hosts.debian.tmpl'",
#        ]
#
#        connection {
#            host = "${openstack_compute_floatingip_v2.live.address}"
#            user = "ubuntu"
#        }
#    }
#
#    triggers {
#        cluster_instance_ids = "${join(", ", openstack_compute_instance_v2.live.*.id)}, ${join(", ", openstack_compute_instance_v2.live-couchdb.*.id)}"
#    }
#}
