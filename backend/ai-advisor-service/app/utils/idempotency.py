# app/utils/idempotency.py
import hashlib
import uuid

def deterministic_uuid_v3(name: str, namespace: uuid.UUID = uuid.NAMESPACE_DNS) -> str:
    """
    Retorna un UUIDv3 determinista (MD5).
    """
    return str(uuid.uuid3(namespace, name))

def java_like_nameuuid(name: str) -> str:
    """
    Emula Java UUID.nameUUIDFromBytes(name.getBytes(UTF-8)) sin namespace explícito.
    """
    md5 = hashlib.md5(name.encode("utf-8")).digest()
    b = bytearray(md5)
    b[6] = (b[6] & 0x0F) | 0x30  # version 3
    b[8] = (b[8] & 0x3F) | 0x80  # variant
    return str(uuid.UUID(bytes=bytes(b)))
