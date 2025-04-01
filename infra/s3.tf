resource "aws_s3_bucket" "hunko_course_images" {
  bucket = var.bucket_name

  lifecycle {
    prevent_destroy = true
  }

}

resource "aws_s3_bucket_policy" "my_bucket_policy" {
  bucket = aws_s3_bucket.hunko_course_images.id
  policy = data.aws_iam_policy_document.allow_cloudfront_access.json
}

data "aws_iam_policy_document" "allow_cloudfront_access" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.hunko_course_images.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.hunko_course_images_cdn.arn]
    }
  }
}
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.hunko_course_images.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.compress_image_lambda.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "images/"
  }

  depends_on = [aws_lambda_permission.compress_image_lambda_allow_bucket_notifications]
}
