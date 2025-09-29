import secrets
import string

ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # sin O/0/I/1 confusas

def gen_short_code(length: int = 6) -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(length))
