from sqlalchemy import Column, String, Integer, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from passlib.apps import custom_app_context as pwd_context

Base = declarative_base()


class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    name = Column(String(250), nullable=False)
    email = Column(String(250))
    # organization = Column(String(250))
    # designation = Column(String(250))
    # phone = Column(String(100))
    password_hash = Column(String(250))

    def hash_password(self, password):
        self.password_hash = pwd_context.encrypt(password, rounds=1000, salt_size=1)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)


engine = create_engine('mysql://root:root@localhost/edvantics')
Base.metadata.create_all(engine)
