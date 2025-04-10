from flask import Blueprint, request, jsonify
from ..models.transportation import Transportation
from ..models.spot import Spot
from ..services.maps_scraper import MapsScraper
from .. import db

transportation_bp = Blueprint('transportation', __name__)
maps_scraper = MapsScraper()

@transportation_bp.route('/api/transportation', methods=['POST'])
def add_transportation():
    data = request.json
    
    # Get origin and destination addresses
    from_spot = Spot.query.get(data['from_id'])
    to_spot = Spot.query.get(data['to_id'])
    
    if not from_spot or not to_spot:
        return jsonify({'error': 'Invalid spot IDs'}), 400
    
    # Get travel details
    travel_details = maps_scraper.get_travel_time(
        from_spot.address,
        to_spot.address,
        data.get('transport_type', 'driving')
    )
    
    new_transport = Transportation(
        from_id=data['from_id'],
        to_id=data['to_id'],
        transport_type=data.get('transport_type'),
        estimated_travel_time=travel_details.get('estimated_travel_time') if travel_details else None,
        distance=travel_details.get('distance') if travel_details else None,
        route_summary=travel_details.get('route_summary') if travel_details else None
    )
    
    db.session.add(new_transport)
    db.session.commit()
    return jsonify({'message': 'Transportation added successfully', 'id': new_transport.id}), 201

@transportation_bp.route('/api/transportation', methods=['GET'])
def get_transportation():
    transports = Transportation.query.all()
    return jsonify([transport.to_dict() for transport in transports]) 