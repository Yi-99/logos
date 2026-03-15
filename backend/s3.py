import os
import logging
import boto3
import config  # noqa: F401 — loads .env.{APP_ENV}

logger = logging.getLogger(__name__)

_region = os.getenv("AWS_REGION", "us-west-1")
_bucket = os.getenv("S3_BUCKET_NAME")
_client = boto3.client("s3", region_name=_region)

logger.info(f"S3Service initialized: bucket={_bucket}, region={_region}")


class S3Service:
    def __init__(self):
        self.client = _client
        self.bucket_name = _bucket

    def generate_presigned_url(self, key: str, expiration: int = 3600) -> str:
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket_name, "Key": key},
            ExpiresIn=expiration,
        )
