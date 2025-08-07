from models import db, User
from utils.enums import UserType

def create_user(data):
    name = data.get('name')
    email = data.get('email')
    user_type = data.get('type')  # Either 'OWNER' or 'PET'
    parent_id = data.get('parent_id') 

    if not name or not email or not user_type:
        raise ValueError("Name, email, and type are required.")
    
    if user_type not in ['OWNER', 'PET']:
        raise ValueError("Invalid user type. Must be 'OWNER' or 'PET'.")
    
    if user_type == 'PET' and not parent_id:
        raise ValueError("A pet must have a parent (owner).")

    if user_type == 'PET':
        parent = User.query.get(parent_id)
        if not parent or parent.type != 'OWNER':
            raise ValueError("The provided parent_id does not correspond to a valid OWNER.")
    
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        raise ValueError("A user with this email already exists.")
    
    # Create the new user
    new_user = User(
        name=name,
        email=email,
        type=user_type,
        parent_id=parent_id if user_type == 'PET' else None 
    )

    db.session.add(new_user)
    db.session.commit()
    
    return new_user

def get_user_details(id):
    user = User.query.get(id)
    return user


def update_user(user_id, data):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found.")
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        user.email = data['email']
    db.session.commit()
    return user

def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found.")
    db.session.delete(user)
    db.session.commit()

def get_all_pets():
    pets = db.session.query(
        User.name.label('pet_name'),
        User.image.label('pet_image'),
        User.parent_id,
        User.parent.name.label('owner_name') 
    ).join(
        User.parent 
    ).filter(
        User.type == UserType.PET
    ).all()
    
    pets_data = [{"pet_name": pet.pet_name, "parent_name": pet.owner_name, "pet_image": pet.pet_image} for pet in pets]

    return pets_data