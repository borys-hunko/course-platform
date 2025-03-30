resource "aws_sqs_queue" "compress_success_image_notification_sqs_queue" {
  name                       = "compress_success_image_notification_sqs_queue"
  visibility_timeout_seconds = 300
}
