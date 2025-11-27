import requests
import logging
import base64

from app.core.config import settings

logger = logging.getLogger(__name__)


def image_to_base64(image_path: str) -> str:
    """
    Convert image file to base64 encoded string with data URI prefix
    Returns: base64 encoded image string with data URI prefix
    """
    try:
        with open(image_path, "rb") as f:
            img_bytes = f.read()
            img_base64 = base64.b64encode(img_bytes).decode("utf-8")
            return f"data:image/png;base64,{img_base64}"
    except Exception as e:
        logger.error(f"[VLM] Error converting image to base64: {e}", exc_info=True)
        raise


def call_vlm_api(image_base64: str) -> str:
    """
    Call VLM API to extract text from image
    Args:
        image_base64: Base64 encoded image string with data URI prefix (data:image/png;base64,...)
    Returns: Extracted text in markdown format
    """
    try:
        logger.debug(f"[VLM] Using provided base64 image (length: {len(image_base64)})")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.API_KEY}"
        }

        payload = {
            "model": settings.VLM_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Trích xuất toàn bộ dữ liệu chữ từ ảnh thành định dạng markdown, không bỏ sót dữ liệu nào",
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": image_base64}
                        },
                    ],
                }
            ],
            "system_prompt": "Extract all text information from image to Key:Value text format (not a json format). Separate paragraphs with '###'",
            "streaming": False,
            "temperature": 1,
            "max_tokens": 1024,
            "top_p": 1,
            "top_k": 40,
            "presence_penalty": 0,
            "frequency_penalty": 0,
        }

        logger.debug(f"[VLM] Sending POST request to {settings.VLM_API_URL}")
        response = requests.post(settings.VLM_API_URL, headers=headers, json=payload, timeout=60)
        logger.debug(f"[VLM] Response status: {response.status_code}")
        response.raise_for_status()

        result = response.json()
        content = result["choices"][0]["message"]["content"]
        logger.debug(f"[VLM] Received markdown, length: {len(content) if content else 0}")
        logger.info(f"[VLM] Extracted text preview: {content[:100] if content else 'None'}...")

        return content

    except requests.exceptions.RequestException as e:
        logger.error(f"[VLM] Request error: {e}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"[VLM] Unexpected error: {e}", exc_info=True)
        raise