variable "count" {
    default = 1
    description = "The number of instances to create"
}

variable "server_type" {
    description = "The server type used for naming and references"
}

variable "ipv4_address" {
    description = "The IPv4 address of this server"
}

variable "user_data" {
    default = ""
    description = "Some user data to inject into the openstack compute instance"
}
