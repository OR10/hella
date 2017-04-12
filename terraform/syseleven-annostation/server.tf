variable "app-count" {
  default = 1
}

variable "couchdb-count" {
  default = 2
}

variable "flavors" {
  type = "map"
  default = {
    "app-0.labeltool" = "m1.small"
    "couchdb-0.labeltool" = "m1.small"
    "couchdb-1.labeltool" = "m1.tiny"
  }
}

resource "openstack_compute_floatingip_v2" "labeltool" {
    count = "${var.app-count}"

    pool = "ext-net"
}

resource "openstack_compute_instance_v2" "labeltool" {
    count = "${var.app-count}"

    name = "app-${count.index}.labeltool"
    image_id = "d82d843b-bcb5-41d2-b545-a0937c3796ad"
    flavor_name = "${var.flavors["app-${count.index}.labeltool"]}"
    key_pair = "${openstack_compute_keypair_v2.crosscan-chh.name}"
    stop_before_destroy = false

    security_groups = [
        "default",
        "${openstack_compute_secgroup_v2.SSH.name}",
        "${openstack_compute_secgroup_v2.labeltool-app.name}",
    ]

    floating_ip = "${openstack_compute_floatingip_v2.labeltool.address}"

    network {
        name = "labeltool"
    }

    provisioner "file" {
        source = "puppet"
        destination = "/home/ubuntu/puppet"

        connection {
            host = "${openstack_compute_floatingip_v2.labeltool.address}"
            user = "ubuntu"
        }
    }

    provisioner "remote-exec" {
        script = "provision.sh"

        connection {
            host = "${openstack_compute_floatingip_v2.labeltool.address}"
            user = "ubuntu"
        }
    }
}

resource "openstack_compute_instance_v2" "labeltool-couchdb" {
    count = "${var.couchdb-count}"

    name = "couchdb-${count.index}.labeltool"
    image_id = "d82d843b-bcb5-41d2-b545-a0937c3796ad"
    flavor_name = "${var.flavors["couchdb-${count.index}.labeltool"]}"
    key_pair = "${openstack_compute_keypair_v2.crosscan-chh.name}"
    stop_before_destroy = false

    security_groups = [
        "default",
    ]

    network {
        name = "labeltool"
    }

    provisioner "file" {
        source = "puppet"
        destination = "/home/ubuntu/puppet"

        connection {
            user = "ubuntu"
            agent = "true"
            bastion_host = "${openstack_compute_floatingip_v2.labeltool.address}"
        }
    }

    provisioner "remote-exec" {
        script = "provision.sh"

        connection {
            user = "ubuntu"
            agent = "true"
            bastion_host = "${openstack_compute_floatingip_v2.labeltool.address}"
        }
    }
}

# clear couchdb hosts known to the app server
resource "null_resource" "clear-couchdb-hosts" {
    provisioner "remote-exec" {
        inline = [
            "sudo sed -i -r 's/.* couch[0-9]+$//' /etc/hosts",
            "sudo sed -i -r 's/.* couch[0-9]+$//' /etc/cloud/templates/hosts.debian.tmpl",
        ]
    }

    connection {
        host = "${openstack_compute_floatingip_v2.labeltool.address}"
        user = "ubuntu"
    }

    triggers {
        cluster_instance_ids = "${join(", ", openstack_compute_instance_v2.labeltool.*.id)}, ${join(", ", openstack_compute_instance_v2.labeltool-couchdb.*.id)}"
    }
}

# make couchdb hosts known to the app server
resource "null_resource" "add-couchdb-hosts" {
    count = "${var.couchdb-count}"

    depends_on = ["null_resource.clear-couchdb-hosts"]

    provisioner "remote-exec" {
        inline = [
            # add to current /etc/hosts so we don't have to reboot
            "sudo sh -c 'echo \"${element(openstack_compute_instance_v2.labeltool-couchdb.*.access_ip_v4, count.index)} couch-${count.index}\" >> /etc/hosts'",
            # add to hosts template to make it persistent accross reboots
            "sudo sh -c 'echo \"${element(openstack_compute_instance_v2.labeltool-couchdb.*.access_ip_v4, count.index)} couch-${count.index}\" >> /etc/cloud/templates/hosts.debian.tmpl'",
        ]

        connection {
            host = "${openstack_compute_floatingip_v2.labeltool.address}"
            user = "ubuntu"
        }
    }

    triggers {
        cluster_instance_ids = "${join(", ", openstack_compute_instance_v2.labeltool.*.id)}, ${join(", ", openstack_compute_instance_v2.labeltool-couchdb.*.id)}"
    }
}
