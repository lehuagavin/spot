"""
身份证加密工具
"""
import hashlib
from cryptography.fernet import Fernet
from src.core.config import settings


# 使用配置中的密钥，如果没有则使用默认密钥（仅用于开发）
def get_cipher_key() -> bytes:
    """获取加密密钥"""
    key = settings.secret_key
    # 使用 SHA256 派生固定长度的密钥
    derived_key = hashlib.sha256(key.encode()).digest()
    # Fernet 需要 base64 编码的 32 字节密钥
    import base64
    return base64.urlsafe_b64encode(derived_key)


def encrypt_id_number(id_number: str) -> str:
    """加密身份证号

    Args:
        id_number: 身份证号明文

    Returns:
        加密后的身份证号
    """
    cipher = Fernet(get_cipher_key())
    encrypted = cipher.encrypt(id_number.encode('utf-8'))
    return encrypted.decode('utf-8')


def decrypt_id_number(encrypted_id_number: str) -> str:
    """解密身份证号

    Args:
        encrypted_id_number: 加密后的身份证号

    Returns:
        身份证号明文
    """
    cipher = Fernet(get_cipher_key())
    decrypted = cipher.decrypt(encrypted_id_number.encode('utf-8'))
    return decrypted.decode('utf-8')


def hash_id_number(id_number: str) -> str:
    """计算身份证号哈希

    Args:
        id_number: 身份证号

    Returns:
        哈希值
    """
    return hashlib.sha256(id_number.encode('utf-8')).hexdigest()
