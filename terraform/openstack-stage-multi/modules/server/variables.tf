variable "count" {
    default = 1
    description = "The number of instances to create"
}

variable "server_type" {
    description = "The server type used for naming and references"
}

variable "flavor" {
    default = "m1.small"
    description = "The flavor for this server"
}

variable "ipv4_address" {
    description = "The IPv4 address of this server"
}
