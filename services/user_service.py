from models import db, user

def create_user(data):
    name = data.get('name')
    email = data.get('email')
    if not name or not email:
        raise ValueError("Name and email are required.")
    existing_user = user.query.filter_by(email=email).first()
    if existing_user:
        raise ValueError("A user with this email already exists.")
    new_user = user(name=name, email=email)
    db.session.add(new_user)
    db.session.commit()
    return new_user

def get_all_users():
    return user.query.all()

def update_user(user_id, data):
    user = user.query.get(user_id)
    if not user:
        raise ValueError("user not found.")
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        user.email = data['email']
    db.session.commit()
    return user

def delete_user(user_id):
    user = user.query.get(user_id)
    if not user:
        raise ValueError("user not found.")
    db.session.delete(user)
    db.session.commit()
