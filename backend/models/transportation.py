from datetime import datetime
from .. import db

class Transportation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    from_id = db.Column(db.Integer, nullable=False)
    to_id = db.Column(db.Integer, nullable=False)
    estimated_travel_time = db.Column(db.String(50))
    distance = db.Column(db.String(50))
    route_summary = db.Column(db.String(500))
    transport_type = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'from_id': self.from_id,
            'to_id': self.to_id,
            'estimated_travel_time': self.estimated_travel_time,
            'distance': self.distance,
            'route_summary': self.route_summary,
            'transport_type': self.transport_type
        } 