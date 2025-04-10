document.addEventListener('DOMContentLoaded', () => {
    // Initialize map
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 2
    });

    // View toggle functionality
    const listViewBtn = document.getElementById('listViewBtn');
    const mapViewBtn = document.getElementById('mapViewBtn');
    const listView = document.getElementById('listView');
    const mapView = document.getElementById('mapView');

    listViewBtn.addEventListener('click', () => {
        listView.classList.add('active');
        mapView.classList.remove('active');
        listViewBtn.classList.add('active');
        mapViewBtn.classList.remove('active');
    });

    mapViewBtn.addEventListener('click', () => {
        mapView.classList.add('active');
        listView.classList.remove('active');
        mapViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    });

    // Form field visibility based on item type
    const itemType = document.getElementById('itemType');
    const spotFields = document.getElementById('spotFields');
    const accommodationFields = document.getElementById('accommodationFields');
    const transportationFields = document.getElementById('transportationFields');

    itemType.addEventListener('change', () => {
        const type = itemType.value;
        spotFields.style.display = type === 'spot' ? 'block' : 'none';
        accommodationFields.style.display = type === 'accommodation' ? 'block' : 'none';
        transportationFields.style.display = type === 'transportation' ? 'block' : 'none';
        
        if (type === 'transportation') {
            updateLocationDropdowns();
        }
    });

    // Form submission
    const addItemForm = document.getElementById('addItemForm');
    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = itemType.value;
        let data = {};

        if (type === 'spot') {
            data = {
                name: document.getElementById('spotName').value,
                address: document.getElementById('spotAddress').value,
                visit_time: document.getElementById('visitTime').value,
                description: document.getElementById('spotDescription').value
            };
            await addSpot(data);
        } else if (type === 'accommodation') {
            data = {
                name: document.getElementById('accommodationName').value,
                address: document.getElementById('accommodationAddress').value,
                check_in: document.getElementById('checkIn').value,
                check_out: document.getElementById('checkOut').value
            };
            await addAccommodation(data);
        } else if (type === 'transportation') {
            data = {
                from_id: document.getElementById('fromLocation').value,
                to_id: document.getElementById('toLocation').value,
                transport_type: document.getElementById('transportType').value
            };
            await addTransportation(data);
        }

        addItemForm.reset();
        updateItineraryList();
        updateMap();
    });

    // API functions
    async function addSpot(data) {
        try {
            const response = await fetch('http://localhost:5000/api/spots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding spot:', error);
        }
    }

    async function addAccommodation(data) {
        try {
            const response = await fetch('http://localhost:5000/api/accommodations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding accommodation:', error);
        }
    }

    async function addTransportation(data) {
        try {
            const response = await fetch('http://localhost:5000/api/transportation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding transportation:', error);
        }
    }

    async function getSpots() {
        try {
            const response = await fetch('http://localhost:5000/api/spots');
            return await response.json();
        } catch (error) {
            console.error('Error fetching spots:', error);
            return [];
        }
    }

    async function getTransportation() {
        try {
            const response = await fetch('http://localhost:5000/api/transportation');
            return await response.json();
        } catch (error) {
            console.error('Error fetching transportation:', error);
            return [];
        }
    }

    async function updateLocationDropdowns() {
        const spots = await getSpots();
        const fromLocation = document.getElementById('fromLocation');
        const toLocation = document.getElementById('toLocation');

        // Clear existing options
        fromLocation.innerHTML = '<option value="">Select From Location</option>';
        toLocation.innerHTML = '<option value="">Select To Location</option>';

        // Add spot options
        spots.forEach(spot => {
            const option = document.createElement('option');
            option.value = spot.id;
            option.textContent = spot.name;
            fromLocation.appendChild(option.cloneNode(true));
            toLocation.appendChild(option);
        });
    }

    // Update itinerary list
    async function updateItineraryList() {
        const itineraryList = document.getElementById('itineraryList');
        const spots = await getSpots();
        const transports = await getTransportation();
        
        let html = '<h3>Spots</h3>';
        spots.forEach(spot => {
            html += `
                <div class="itinerary-item">
                    <h3>${spot.name}</h3>
                    <p>Address: ${spot.address}</p>
                    <p>Visit Time: ${spot.visit_time || 'Not specified'}</p>
                    <p>Rating: ${spot.rating ? `${spot.rating} (${spot.reviews_count || 'No reviews'})` : 'Not available'}</p>
                    <p>Opening Hours: ${spot.opening_hours || 'Not available'}</p>
                    ${spot.phone ? `<p>Phone: ${spot.phone}</p>` : ''}
                    ${spot.website ? `<p>Website: <a href="${spot.website}" target="_blank">${spot.website}</a></p>` : ''}
                    ${spot.price_level ? `<p>Price Level: ${'$'.repeat(spot.price_level)}</p>` : ''}
                </div>
            `;
        });

        html += '<h3>Transportation</h3>';
        transports.forEach(transport => {
            const fromSpot = spots.find(s => s.id === transport.from_id);
            const toSpot = spots.find(s => s.id === transport.to_id);
            if (fromSpot && toSpot) {
                html += `
                    <div class="itinerary-item">
                        <h3>${fromSpot.name} → ${toSpot.name}</h3>
                        <p>Transport Type: ${transport.transport_type}</p>
                        <p>Estimated Time: ${transport.estimated_travel_time || 'Not available'}</p>
                        <p>Distance: ${transport.distance || 'Not available'}</p>
                        ${transport.route_summary ? `<p>Route: ${transport.route_summary}</p>` : ''}
                    </div>
                `;
            }
        });
        
        itineraryList.innerHTML = html;
    }

    // Update map markers
    async function updateMap() {
        const spots = await getSpots();
        const transports = await getTransportation();
        const markers = [];
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true
        });

        // Clear existing markers and routes
        markers.forEach(marker => marker.setMap(null));
        directionsRenderer.setMap(null);

        // Add spot markers
        spots.forEach(spot => {
            if (spot.latitude && spot.longitude) {
                const marker = new google.maps.Marker({
                    position: { lat: spot.latitude, lng: spot.longitude },
                    map: map,
                    title: spot.name
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <h3>${spot.name}</h3>
                        <p>${spot.address}</p>
                        <p>Rating: ${spot.rating ? `${spot.rating} (${spot.reviews_count || 'No reviews'})` : 'Not available'}</p>
                        <p>Opening Hours: ${spot.opening_hours || 'Not available'}</p>
                        ${spot.phone ? `<p>Phone: ${spot.phone}</p>` : ''}
                        ${spot.website ? `<p>Website: <a href="${spot.website}" target="_blank">${spot.website}</a></p>` : ''}
                        ${spot.price_level ? `<p>Price Level: ${'$'.repeat(spot.price_level)}</p>` : ''}
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });

                markers.push(marker);
            }
        });

        // Add transportation routes
        transports.forEach(transport => {
            const fromSpot = spots.find(s => s.id === transport.from_id);
            const toSpot = spots.find(s => s.id === transport.to_id);
            
            if (fromSpot && toSpot && fromSpot.latitude && fromSpot.longitude && toSpot.latitude && toSpot.longitude) {
                const request = {
                    origin: { lat: fromSpot.latitude, lng: fromSpot.longitude },
                    destination: { lat: toSpot.latitude, lng: toSpot.longitude },
                    travelMode: google.maps.TravelMode[transport.transport_type.toUpperCase()] || google.maps.TravelMode.DRIVING
                };

                directionsService.route(request, (result, status) => {
                    if (status === 'OK') {
                        directionsRenderer.setDirections(result);
                    }
                });
            }
        });

        // Fit map to show all markers
        if (markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            markers.forEach(marker => bounds.extend(marker.getPosition()));
            map.fitBounds(bounds);
        }
    }

    // Initialize
    updateItineraryList();
    updateMap();
}); 