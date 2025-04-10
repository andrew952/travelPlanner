from datetime import datetime
from .. import db

class Spot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    visit_time = db.Column(db.String(50))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    address = db.Column(db.String(200))
    rating = db.Column(db.Float)
    opening_hours = db.Column(db.String(500))
    reviews_count = db.Column(db.String(50))
    phone = db.Column(db.String(50))
    website = db.Column(db.String(200))
    price_level = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'visit_time': self.visit_time,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address,
            'rating': self.rating,
            'opening_hours': self.opening_hours,
            'reviews_count': self.reviews_count,
            'phone': self.phone,
            'website': self.website,
            'price_level': self.price_level
        } 