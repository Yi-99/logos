import logging
from s3 import S3Service

logger = logging.getLogger(__name__)


def get_philosopher_image_url(image_key: str) -> dict:
    """
    Generate a presigned S3 URL for a philosopher's portrait image.
    """
    logger.info(f"Generating presigned URL for key: '{image_key}'")
    s3_service = S3Service()
    logger.info(f"S3 bucket: '{s3_service.bucket_name}', region: '{s3_service.client.meta.region_name}'")
    try:
        url = s3_service.generate_presigned_url(image_key)
        logger.info(f"Generated URL: {url[:100]}...")
        return {"url": url}
    except Exception as e:
        logger.error(f"Failed to generate presigned URL for key '{image_key}': {e}", exc_info=True)
        raise
