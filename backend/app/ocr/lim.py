import requests
import logging
import json

from app.core.config import settings

logger = logging.getLogger(__name__)


def call_llm_api(markdown_text: str) -> dict:
    """
    Call LLM API to convert markdown to structured JSON
    Args:
        markdown_text: Markdown text to parse
    Returns: Parsed JSON object or None if error
    """
    try:
        query = """Bạn là một hệ thống trích xuất dữ liệu chính xác từ văn bản hóa đơn dạng Markdown.
    ## Yêu cầu:
    Phân tích kỹ nội dung Markdown của hóa đơn đầu vào và trả kết quả dưới dạng JSON theo đúng mẫu sau:
    {
        "seller": {
            "name": "",
            "address": "",
            "phone": "",
            "fax": "",
            "tax_code": ""
        },
        "invoice": {
            "title": "",
            "serial": "",
            "number": "",
            "date": "",
            "cqt_code": ""
        },
        "buyer": {
            "name": "",
            "unit_name": "",
            "cccd": "",
            "passport": "",
            "tax_code": "",
            "address": "",
            "payment_method": ""
        },
        "items": [
            {
                "stt": "",
                "name": "",
                "unit": "",
                "quantity": "",
                "unit_price": "",
                "amount": ""
            }
        ],
        "totals": {
            "subtotal": "",
            "vat_rate": "",
            "vat_amount": "",
            "total": "",
            "total_in_words": ""
        }
    }
    ## Quy tắc:
    - Chỉ trả về JSON hợp lệ, không thêm lời giải thích.
    - Nếu trường không tìm thấy, để giá trị là chuỗi rỗng "".
    - Các số tiền BỎ HẾT dấu chấm phân cách hàng nghìn, chỉ giữ lại chữ số (ví dụ: 256.050 -> 256050).
    - Ngày tháng chuyển về định dạng dd/mm/yyyy nếu có thể.
    - Không thay đổi ngữ nghĩa của dữ liệu trong văn bản.
    - Không sửa chính tả của câu gốc.
    
    Dữ liệu đầu vào (Markdown):
    <markdown>
    {markdown_text}
    </markdown>
    """

        query = query.replace("{markdown_text}", markdown_text)

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.API_KEY}"
        }

        payload = {
            "model": settings.LLM_MODEL,
            "messages": [{"role": "user", "content": query}],
            "system_prompt": "",
            "streaming": False,
            "temperature": 0,
            "max_tokens": 8192,
            "top_p": 1,
            "top_k": 40,
            "presence_penalty": 0,
            "frequency_penalty": 0,
        }

        logger.info(f"[LLM] Calling LLM API to parse markdown to JSON...")
        logger.debug(f"[LLM] Markdown length: {len(markdown_text)}")
        logger.debug(f"[LLM] Sending POST request to {settings.LLM_API_URL}")

        response = requests.post(settings.LLM_API_URL, headers=headers, json=payload, timeout=60)
        logger.debug(f"[LLM] Response status: {response.status_code}")
        response.raise_for_status()

        result = response.json()
        content = result["choices"][0]["message"]["content"]

        # Try to parse JSON from response
        # Sometimes LLM might wrap JSON in code blocks
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        parsed_json = json.loads(content)
        logger.info(f"[LLM] ✅ JSON parsed successfully")
        logger.debug(f"[LLM] Parsed JSON keys: {list(parsed_json.keys()) if isinstance(parsed_json, dict) else 'N/A'}")

        return parsed_json

    except json.JSONDecodeError as e:
        logger.error(f"[LLM] ❌ Error parsing JSON: {str(e)}")
        logger.error(f"[LLM] Raw content: {content[:500] if 'content' in locals() else 'N/A'}")
        return None
    except requests.exceptions.RequestException as e:
        logger.error(f"[LLM] Request error: {e}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"[LLM] Unexpected error: {e}", exc_info=True)
        return None