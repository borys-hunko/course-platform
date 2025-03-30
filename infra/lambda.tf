locals {
  lambda_name = "compress_uploaded_s3_image_lambda"
}

data "aws_iam_policy_document" "lambda_role_assume_policy_document" {
  version = "2012-10-17"
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"
      identifiers = [
        "lambda.amazonaws.com",
      ]
    }

    effect = "Allow"
  }
}

data "archive_file" "compress_image_lambda_zip" {
  output_path = "${path.module}/../lambda/compress_image_lambda.zip"
  type        = "zip"
  source_dir  = "${path.module}/../lambda"
  excludes = [
    ".ts",
    "src",
    ".tsconfig",
    "eslint.config.mjs",
    ".prettierrc",
    "package.json",
    "package-lock.json",
    ".zip",
    "tsconfig.json"
  ]
}

resource "aws_lambda_function" "compress_image_lambda" {
  function_name    = local.lambda_name
  role             = aws_iam_role.compress_image_lambda_role.arn
  memory_size      = 128
  timeout          = 60
  handler          = "dist/src/compressS3PutImageHandler.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.compress_image_lambda_zip.output_path
  source_code_hash = filebase64sha256(data.archive_file.compress_image_lambda_zip.output_path)

  environment {
    variables = {
      REGION     = var.region
      QUEUE_URL  = aws_sqs_queue.compress_success_image_notification_sqs_queue.url
      NODE_ENV   = "production"
    }
  }
}

resource "aws_iam_role" "compress_image_lambda_role" {
  name               = "${local.lambda_name}-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_role_assume_policy_document.json
}

resource "aws_iam_policy" "compress_image_lambda_policy" {
  name = "compress_image_lambda_policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "s3:GetObject",
          "s3:PutObject",
          "sqs:SendMessage",
        ]
        Effect = "Allow"
        Resource = [
          "${aws_s3_bucket.hunko_course_images.arn}/*",
          aws_sqs_queue.compress_success_image_notification_sqs_queue.arn,
          "arn:aws:logs:*:*:*", # for development
          # "arn:aws:logs:${var.region}:${data.aws_caller_identity.current_acc.account_id}:log-group:/aws/lambda/${local.lambda_name}:*" # for production
        ]
      }
    ]
  })
}

resource "aws_iam_policy_attachment" "compress_image_lambda_policy_attachment" {
  name       = "compress_image_lambda_policy_attachment"
  policy_arn = aws_iam_policy.compress_image_lambda_policy.arn
  roles = [aws_iam_role.compress_image_lambda_role.name]
}

resource "aws_lambda_permission" "compress_image_lambda_allow_bucket_notifications" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.compress_image_lambda.arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.hunko_course_images.arn
}