from flask import Blueprint, request, jsonify
from ..models.spot import Spot
from ..services.maps_scraper import MapsScraper
from .. import db

spots_bp = Blueprint('spots', __name__)
maps_scraper = MapsScraper()

@spots_bp.route('/api/spots', methods=['POST'])
def add_spot():
    data = request.json
    address = data.get('address')
    
    # Get coordinates
    latitude, longitude = maps_scraper.get_location_coordinates(address)
    
    # Get place details
    place_details = maps_scraper.get_place_details(data['name'], address)
    
    new_spot = Spot(
        name=data['name'],
        description=data.get('description'),
        visit_time=data.get('visit_time'),
        latitude=latitude,
        longitude=longitude,
        address=address,
        rating=place_details.get('rating') if place_details else None,
        opening_hours=place_details.get('opening_hours') if place_details else None,
        reviews_count=place_details.get('reviews_count') if place_details else None,
        phone=place_details.get('phone') if place_details else None,
        website=place_details.get('website') if place_details else None,
        price_level=place_details.get('price_level') if place_details else None
    )
    
    db.session.add(new_spot)
    db.session.commit()
    return jsonify({'message': 'Spot added successfully', 'id': new_spot.id}), 201

@spots_bp.route('/api/spots', methods=['GET'])
def get_spots():
    spots = Spot.query.all()
    return jsonify([spot.to_dict() for spot in spots]) 