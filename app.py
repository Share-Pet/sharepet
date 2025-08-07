from flask import Flask, request, jsonify
from utils.db import init_db

from services import (
    user_service
)

app = Flask(__name__)
init_db(app)

@app.route('/health', methods=['GET'])
def get_health():
    return jsonify({"success": True, "message": 'Hey Doc! I am healthy'}), 200

@app.route('/', methods=['GET'])
def home():
    return get_health()

@app.route('/home', methods=['GET'])
def home():
    pets = user_service.get_all_pets()
    return jsonify({"success": True, "data": pets}), 200
    
@app.route('/create-user', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        c = user_service.create_user(data)
        return jsonify({
            "success": True,
            "user": {
                "id": c.id,
                "name": c.name,
                "email": c.email,
                "type": c.type.value,  # Include user type in response
                "parent_id": c.parent_id if c.type == 'PET' else None
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/profile/<int:id>', methods=['GET'])
def get_user(id):
    try:
        # Fetch user details based on the provided id
        user_details = user_service.get_user_details(id)
        
        if not user_details:
            raise ValueError("User not found.")
        
        # Format the user details in the response
        result = {
            "id": user_details.id,
            "name": user_details.name,
            "email": user_details.email,
            "type": user_details.type.value,  # Include user type
            "parent_id": user_details.parent_id if user_details.type == 'PET' else None,
            "image": user_details.image
        }

        return jsonify({"success": True, "user": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)