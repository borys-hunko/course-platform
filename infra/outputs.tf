output "compressed-image-sqs-url" {
  value = aws_sqs_queue.compress_success_image_notification_sqs_queue.url
}

output "compress-lambda-source-iam" {
  value = aws_lambda_permission.compress_image_lambda_allow_bucket_notifications.source_arn
}

output "compress-lambda-iam" {
  value = aws_iam_policy.compress_image_lambda_policy.arn
}

output "compress-lambda-function-arn" {
  value = aws_lambda_function.compress_image_lambda.arn
}

output "cloudfront-image-domain-name" {
  value = aws_cloudfront_distribution.hunko_course_images_cdn.domain_name
}