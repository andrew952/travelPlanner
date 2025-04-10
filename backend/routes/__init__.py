from flask import Blueprint
from .spots import spots_bp
from .accommodations import accommodations_bp
from .transportation import transportation_bp

__all__ = ['spots_bp', 'accommodations_bp', 'transportation_bp'] 