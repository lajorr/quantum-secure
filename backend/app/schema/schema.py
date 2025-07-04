# to deserialize or serialize no sql info
# from bson import ObjectId

def user_serializer(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"]
    }
