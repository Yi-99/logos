from s3 import S3Service


def get_philosopher_image_url(image_key: str) -> dict:
    """
    Generate a presigned S3 URL for a philosopher's portrait image.
    """
    s3_service = S3Service()
    url = s3_service.generate_presigned_url(image_key)
    return {"url": url}
