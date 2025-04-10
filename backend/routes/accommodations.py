from flask import Blueprint, request, jsonify
from ..models.accommodation import Accommodation
from ..services.maps_scraper import MapsScraper
from .. import db

accommodations_bp = Blueprint('accommodations', __name__)
maps_scraper = MapsScraper()

@accommodations_bp.route('/api/accommodations', methods=['POST'])
def add_accommodation():
    data = request.json
    address = data.get('address')
    
    # Get place details
    place_details = maps_scraper.get_place_details(data['name'], address)
    
    new_accommodation = Accommodation(
        name=data['name'],
        address=address,
        check_in=data.get('check_in'),
        check_out=data.get('check_out'),
        rating=place_details.get('rating') if place_details else None,
        reviews_count=place_details.get('reviews_count') if place_details else None,
        phone=place_details.get('phone') if place_details else None,
        website=place_details.get('website') if place_details else None,
        price_level=place_details.get('price_level') if place_details else None
    )
    
    db.session.add(new_accommodation)
    db.session.commit()
    return jsonify({'message': 'Accommodation added successfully', 'id': new_accommodation.id}), 201

@accommodations_bp.route('/api/accommodations', methods=['GET'])
def get_accommodations():
    accommodations = Accommodation.query.all()
    return jsonify([accommodation.to_dict() for accommodation in accommodations]) 