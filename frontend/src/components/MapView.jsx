import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, Tabs, Tag, Button, Tooltip, Space, Input, Select } from 'antd';
import { HomeOutlined, ShopOutlined, CarOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { theme } from 'antd';

const { TabPane } = Tabs;
const { Option } = Select;

const MapView = () => {
  const [spots, setSpots] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [transportations, setTransportations] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('spots');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { token } = theme.useToken();

  const mapContainerStyle = {
    width: '100%',
    height: 'calc(100vh - 200px)',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  const center = {
    lat: 0,
    lng: 0
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [spotsRes, accRes, transRes] = await Promise.all([
        fetch('http://localhost:5000/spots'),
        fetch('http://localhost:5000/accommodations'),
        fetch('http://localhost:5000/transportation')
      ]);

      const spotsData = await spotsRes.json();
      const accData = await accRes.json();
      const transData = await transRes.json();

      setSpots(spotsData);
      setAccommodations(accData);
      setTransportations(transData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'spot':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: { width: 40, height: 40 }
        };
      case 'accommodation':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: { width: 40, height: 40 }
        };
      case 'transportation':
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: { width: 40, height: 40 }
        };
      default:
        return {
          url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
          scaledSize: { width: 40, height: 40 }
        };
    }
  };

  const filteredItems = () => {
    let items = [];
    switch (activeTab) {
      case 'spots':
        items = spots;
        break;
      case 'accommodations':
        items = accommodations;
        break;
      case 'transportation':
        items = transportations;
        break;
      default:
        return [];
    }

    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filterType === 'all') return matchesSearch;
      
      if (activeTab === 'transportation') {
        return matchesSearch && item.type === filterType;
      }
      
      return matchesSearch;
    });
  };

  const renderMarkers = () => {
    return filteredItems().map(item => {
      const position = activeTab === 'transportation'
        ? { lat: parseFloat(item.from_location.split(',')[0]), lng: parseFloat(item.from_location.split(',')[1]) }
        : { lat: parseFloat(item.location.split(',')[0]), lng: parseFloat(item.location.split(',')[1]) };

      return (
        <Marker
          key={`${activeTab}-${item.id}`}
          position={position}
          icon={getIcon(activeTab === 'spots' ? 'spot' : activeTab === 'accommodations' ? 'accommodation' : 'transportation')}
          onClick={() => setSelectedItem({ ...item, type: activeTab })}
        />
      );
    });
  };

  const renderInfoWindow = () => {
    if (!selectedItem) return null;

    const position = selectedItem.type === 'transportation'
      ? { lat: parseFloat(selectedItem.from_location.split(',')[0]), lng: parseFloat(selectedItem.from_location.split(',')[1]) }
      : { lat: parseFloat(selectedItem.location.split(',')[0]), lng: parseFloat(selectedItem.location.split(',')[1]) };

    return (
      <InfoWindow
        position={position}
        onCloseClick={() => setSelectedItem(null)}
      >
        <div style={{ maxWidth: '200px' }}>
          <h3 style={{ marginBottom: '8px' }}>{selectedItem.name}</h3>
          {selectedItem.type === 'spots' && (
            <>
              <p style={{ marginBottom: '8px' }}>{selectedItem.description}</p>
              <Tag color="red">Tourist Spot</Tag>
            </>
          )}
          {selectedItem.type === 'accommodations' && (
            <>
              <p style={{ marginBottom: '8px' }}>Price per night: ${selectedItem.price_per_night}</p>
              <Tag color="blue">Accommodation</Tag>
            </>
          )}
          {selectedItem.type === 'transportation' && (
            <>
              <p style={{ marginBottom: '4px' }}>Type: {selectedItem.type}</p>
              <p style={{ marginBottom: '4px' }}>From: {selectedItem.from_location}</p>
              <p style={{ marginBottom: '4px' }}>To: {selectedItem.to_location}</p>
              <p style={{ marginBottom: '8px' }}>Price: ${selectedItem.price}</p>
              <Tag color="green">Transportation</Tag>
            </>
          )}
        </div>
      </InfoWindow>
    );
  };

  return (
    <Card
      style={{
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            style={{ marginBottom: 0 }}
          >
            <TabPane tab={<span><ShopOutlined /> Spots</span>} key="spots" />
            <TabPane tab={<span><HomeOutlined /> Accommodations</span>} key="accommodations" />
            <TabPane tab={<span><CarOutlined /> Transportation</span>} key="transportation" />
          </Tabs>
          <Space>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
            />
            {activeTab === 'transportation' && (
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: 120 }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Types</Option>
                <Option value="flight">Flight</Option>
                <Option value="train">Train</Option>
                <Option value="bus">Bus</Option>
                <Option value="car">Car</Option>
              </Select>
            )}
          </Space>
        </Space>
      </div>

      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={2}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {renderMarkers()}
          {renderInfoWindow()}
        </GoogleMap>
      </LoadScript>
    </Card>
  );
};

export default MapView; 