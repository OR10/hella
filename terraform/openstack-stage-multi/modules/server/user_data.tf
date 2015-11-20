
resource "template_file" "user_data" {
    filename = "${path.module}/user_data.tpl"
}
