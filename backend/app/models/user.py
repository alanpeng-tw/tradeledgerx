from beanie import Document, Indexed

class User(Document):
    username: Indexed(str, unique=True)
    hashed_password: str
    role: str = "user"  # "admin" | "user"

    class Settings:
        name = "users"
