from models import db, Event, UserRegistration

def create_event(data):
    event_start_datetime = data.get('event_start_datetime')
    event_end_datetime = data.get('event_end_datetime')
    event_type = data.get('event_type')
    event_name = data.get('event_name')
    event_desc = data.get('event_desc')

    event = Event(
        event_start_datetime=event_start_datetime,
        event_end_datetime=event_end_datetime,
        event_type=event_type,
        event_name=event_name,
        event_desc=event_desc
    )

    db.session.add(event)
    db.session.commit()
    return event

def register_user_for_event(user_id, event_id):
    registration = UserRegistration(
        user_id=user_id,
        event_id=event_id
    )

    db.session.add(registration)
    db.session.commit()
    return registration
