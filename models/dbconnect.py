from sqlalchemy import create_engine, and_
from sqlalchemy.orm import sessionmaker
from database_setup import Base, User

# Connect to Database and create database session
engine = create_engine('mysql://root:root@localhost/edvantics')
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()


