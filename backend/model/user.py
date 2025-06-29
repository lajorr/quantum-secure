from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username : str
    email : EmailStr    

class UserCreate(UserBase):
    password : str

class UserResponse(UserBase):
    id: str 
    
class UserInDB(UserCreate):
    hashed_password : str

class Token(BaseModel):
    access_token : str
    token_type : str


class TokenData(BaseModel):
    username: str | None = None
    id: str | None = None
