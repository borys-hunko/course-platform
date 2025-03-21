locals {
  oac_name               = "${var.bucket_name}-cf-origin-access-control"
  image_bucket_origin_id = "hunko-images-access-control"
}

resource "aws_cloudfront_distribution" "hunko_course_images_cdn" {
  origin {
    domain_name = aws_s3_bucket.hunko_course_images.bucket_regional_domain_name
    origin_id   = local.image_bucket_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.hunko_course_images_cdn_oac.id
  }

  is_ipv6_enabled = true

  enabled = true

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.image_bucket_origin_id
    viewer_protocol_policy = "allow-all"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_origin_access_control" "hunko_course_images_cdn_oac" {
  name                              = local.oac_name
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}