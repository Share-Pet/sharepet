from models import Contestant
from app import db

def create_contestant(data):
    name = data.get('name')
    email = data.get('email')
    if not name or not email:
        raise ValueError("Name and email are required.")
    new_contestant = Contestant(name=name, email=email)
    db.session.add(new_contestant)
    db.session.commit()
    return new_contestant

def get_all_contestants():
    return Contestant.query.all()

def update_contestant(contestant_id, data):
    contestant = Contestant.query.get_or_404(contestant_id)
    if 'name' in data:
        contestant.name = data['name']
    if 'email' in data:
        contestant.email = data['email']
    db.session.commit()
    return contestant

def delete_contestant(contestant_id):
    contestant = Contestant.query.get_or_404(contestant_id)
    db.session.delete(contestant)
    db.session.commit()
