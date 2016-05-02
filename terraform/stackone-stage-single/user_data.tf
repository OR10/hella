
resource "template_file" "user_data" {
    template = "${path.module}/user_data.tpl"
}
