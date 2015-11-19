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
