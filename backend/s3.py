import os
import boto3
from dotenv import load_dotenv


class S3Service:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(S3Service, cls).__new__(cls)
            load_dotenv()

            cls._instance.client = boto3.client(
                "s3",
                region_name=os.getenv("AWS_REGION", "us-west-1"),
            )
            cls._instance.bucket_name = os.getenv("S3_BUCKET_NAME")
        return cls._instance

    def get_client(self):
        return self.client

    def generate_presigned_url(self, key: str, expiration: int = 3600) -> str:
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket_name, "Key": key},
            ExpiresIn=expiration,
        )
