from flask import Flask, render_template
from . import create_app
from .models import db
import os

app = create_app()

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 