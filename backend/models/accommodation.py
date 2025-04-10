from datetime import datetime
from .. import db

class Accommodation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200))
    rating = db.Column(db.Float)
    check_in = db.Column(db.String(50))
    check_out = db.Column(db.String(50))
    reviews_count = db.Column(db.String(50))
    phone = db.Column(db.String(50))
    website = db.Column(db.String(200))
    price_level = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'rating': self.rating,
            'check_in': self.check_in,
            'check_out': self.check_out,
            'reviews_count': self.reviews_count,
            'phone': self.phone,
            'website': self.website,
            'price_level': self.price_level
        } 