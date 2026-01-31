"""
数据脱敏工具
"""


def mask_phone(phone: str) -> str:
    """手机号脱敏

    Args:
        phone: 手机号

    Returns:
        脱敏后的手机号，如 136****8295
    """
    if not phone or len(phone) < 11:
        return phone
    return f"{phone[:3]}****{phone[-4:]}"


def mask_id_number(id_number: str) -> str:
    """身份证号脱敏

    Args:
        id_number: 身份证号

    Returns:
        脱敏后的身份证号，如 4401**********1234
    """
    if not id_number or len(id_number) < 18:
        return id_number
    return f"{id_number[:4]}**********{id_number[-4:]}"


def mask_email(email: str) -> str:
    """邮箱脱敏

    Args:
        email: 邮箱

    Returns:
        脱敏后的邮箱，如 a***@example.com
    """
    if not email or "@" not in email:
        return email
    parts = email.split("@")
    username = parts[0]
    domain = parts[1]
    if len(username) <= 1:
        masked_username = username
    else:
        masked_username = f"{username[0]}***"
    return f"{masked_username}@{domain}"
