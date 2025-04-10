from flask import Blueprint, request, jsonify
from . import db
from .models import Spot, Accommodation, Transportation
from datetime import datetime

# Create blueprints for each resource
spots_bp = Blueprint('spots', __name__)
accommodations_bp = Blueprint('accommodations', __name__)
transportation_bp = Blueprint('transportation', __name__)

# Spot routes
@spots_bp.route('/spots', methods=['GET'])
def get_spots():
    spots = Spot.query.all()
    return jsonify([{
        'id': spot.id,
        'name': spot.name,
        'description': spot.description,
        'location': spot.location,
        'created_at': spot.created_at.isoformat(),
        'updated_at': spot.updated_at.isoformat()
    } for spot in spots])

@spots_bp.route('/spots', methods=['POST'])
def create_spot():
    data = request.get_json()
    new_spot = Spot(
        name=data['name'],
        description=data.get('description'),
        location=data['location']
    )
    db.session.add(new_spot)
    db.session.commit()
    return jsonify({
        'id': new_spot.id,
        'name': new_spot.name,
        'description': new_spot.description,
        'location': new_spot.location,
        'created_at': new_spot.created_at.isoformat(),
        'updated_at': new_spot.updated_at.isoformat()
    }), 201

@spots_bp.route('/spots/<int:id>', methods=['GET'])
def get_spot(id):
    spot = Spot.query.get_or_404(id)
    return jsonify({
        'id': spot.id,
        'name': spot.name,
        'description': spot.description,
        'location': spot.location,
        'created_at': spot.created_at.isoformat(),
        'updated_at': spot.updated_at.isoformat()
    })

@spots_bp.route('/spots/<int:id>', methods=['PUT'])
def update_spot(id):
    spot = Spot.query.get_or_404(id)
    data = request.get_json()
    spot.name = data.get('name', spot.name)
    spot.description = data.get('description', spot.description)
    spot.location = data.get('location', spot.location)
    db.session.commit()
    return jsonify({
        'id': spot.id,
        'name': spot.name,
        'description': spot.description,
        'location': spot.location,
        'created_at': spot.created_at.isoformat(),
        'updated_at': spot.updated_at.isoformat()
    })

@spots_bp.route('/spots/<int:id>', methods=['DELETE'])
def delete_spot(id):
    spot = Spot.query.get_or_404(id)
    db.session.delete(spot)
    db.session.commit()
    return '', 204

# Accommodation routes
@accommodations_bp.route('/accommodations', methods=['GET'])
def get_accommodations():
    accommodations = Accommodation.query.all()
    return jsonify([{
        'id': acc.id,
        'name': acc.name,
        'description': acc.description,
        'location': acc.location,
        'price_per_night': acc.price_per_night,
        'created_at': acc.created_at.isoformat(),
        'updated_at': acc.updated_at.isoformat()
    } for acc in accommodations])

@accommodations_bp.route('/accommodations', methods=['POST'])
def create_accommodation():
    data = request.get_json()
    new_acc = Accommodation(
        name=data['name'],
        description=data.get('description'),
        location=data['location'],
        price_per_night=data['price_per_night']
    )
    db.session.add(new_acc)
    db.session.commit()
    return jsonify({
        'id': new_acc.id,
        'name': new_acc.name,
        'description': new_acc.description,
        'location': new_acc.location,
        'price_per_night': new_acc.price_per_night,
        'created_at': new_acc.created_at.isoformat(),
        'updated_at': new_acc.updated_at.isoformat()
    }), 201

@accommodations_bp.route('/accommodations/<int:id>', methods=['GET'])
def get_accommodation(id):
    acc = Accommodation.query.get_or_404(id)
    return jsonify({
        'id': acc.id,
        'name': acc.name,
        'description': acc.description,
        'location': acc.location,
        'price_per_night': acc.price_per_night,
        'created_at': acc.created_at.isoformat(),
        'updated_at': acc.updated_at.isoformat()
    })

@accommodations_bp.route('/accommodations/<int:id>', methods=['PUT'])
def update_accommodation(id):
    acc = Accommodation.query.get_or_404(id)
    data = request.get_json()
    acc.name = data.get('name', acc.name)
    acc.description = data.get('description', acc.description)
    acc.location = data.get('location', acc.location)
    acc.price_per_night = data.get('price_per_night', acc.price_per_night)
    db.session.commit()
    return jsonify({
        'id': acc.id,
        'name': acc.name,
        'description': acc.description,
        'location': acc.location,
        'price_per_night': acc.price_per_night,
        'created_at': acc.created_at.isoformat(),
        'updated_at': acc.updated_at.isoformat()
    })

@accommodations_bp.route('/accommodations/<int:id>', methods=['DELETE'])
def delete_accommodation(id):
    acc = Accommodation.query.get_or_404(id)
    db.session.delete(acc)
    db.session.commit()
    return '', 204

# Transportation routes
@transportation_bp.route('/transportation', methods=['GET'])
def get_transportation():
    transports = Transportation.query.all()
    return jsonify([{
        'id': trans.id,
        'type': trans.type,
        'from_location': trans.from_location,
        'to_location': trans.to_location,
        'departure_time': trans.departure_time.isoformat(),
        'arrival_time': trans.arrival_time.isoformat(),
        'price': trans.price,
        'created_at': trans.created_at.isoformat(),
        'updated_at': trans.updated_at.isoformat()
    } for trans in transports])

@transportation_bp.route('/transportation', methods=['POST'])
def create_transportation():
    data = request.get_json()
    new_trans = Transportation(
        type=data['type'],
        from_location=data['from_location'],
        to_location=data['to_location'],
        departure_time=datetime.fromisoformat(data['departure_time']),
        arrival_time=datetime.fromisoformat(data['arrival_time']),
        price=data['price']
    )
    db.session.add(new_trans)
    db.session.commit()
    return jsonify({
        'id': new_trans.id,
        'type': new_trans.type,
        'from_location': new_trans.from_location,
        'to_location': new_trans.to_location,
        'departure_time': new_trans.departure_time.isoformat(),
        'arrival_time': new_trans.arrival_time.isoformat(),
        'price': new_trans.price,
        'created_at': new_trans.created_at.isoformat(),
        'updated_at': new_trans.updated_at.isoformat()
    }), 201

@transportation_bp.route('/transportation/<int:id>', methods=['GET'])
def get_transport(id):
    trans = Transportation.query.get_or_404(id)
    return jsonify({
        'id': trans.id,
        'type': trans.type,
        'from_location': trans.from_location,
        'to_location': trans.to_location,
        'departure_time': trans.departure_time.isoformat(),
        'arrival_time': trans.arrival_time.isoformat(),
        'price': trans.price,
        'created_at': trans.created_at.isoformat(),
        'updated_at': trans.updated_at.isoformat()
    })

@transportation_bp.route('/transportation/<int:id>', methods=['PUT'])
def update_transportation(id):
    trans = Transportation.query.get_or_404(id)
    data = request.get_json()
    trans.type = data.get('type', trans.type)
    trans.from_location = data.get('from_location', trans.from_location)
    trans.to_location = data.get('to_location', trans.to_location)
    if 'departure_time' in data:
        trans.departure_time = datetime.fromisoformat(data['departure_time'])
    if 'arrival_time' in data:
        trans.arrival_time = datetime.fromisoformat(data['arrival_time'])
    trans.price = data.get('price', trans.price)
    db.session.commit()
    return jsonify({
        'id': trans.id,
        'type': trans.type,
        'from_location': trans.from_location,
        'to_location': trans.to_location,
        'departure_time': trans.departure_time.isoformat(),
        'arrival_time': trans.arrival_time.isoformat(),
        'price': trans.price,
        'created_at': trans.created_at.isoformat(),
        'updated_at': trans.updated_at.isoformat()
    })

@transportation_bp.route('/transportation/<int:id>', methods=['DELETE'])
def delete_transportation(id):
    trans = Transportation.query.get_or_404(id)
    db.session.delete(trans)
    db.session.commit()
    return '', 204 