# to deserialize or serialize no sql info
# from bson import ObjectId

def user_serializer(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "isVerified": user.get("isVerified", False),
        "pub_key": user["pub_key"] if user.get("pub_key") is not None else "",
        "priv_key": user["priv_key"] if user.get("priv_key") is not None else ""
    }
