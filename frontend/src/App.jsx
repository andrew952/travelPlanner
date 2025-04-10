import React, { useState } from 'react';
import { Layout, Menu, theme, ConfigProvider } from 'antd';
import { HomeOutlined, ShopOutlined, CarOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import SpotList from './components/SpotList';
import AccommodationList from './components/AccommodationList';
import TransportationList from './components/TransportationList';
import MapView from './components/MapView';

const { Header, Content, Footer } = Layout;

function App() {
  const [activeTab, setActiveTab] = useState('map');
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ 
          position: 'fixed', 
          zIndex: 1, 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 50px',
          background: 'linear-gradient(90deg, #1890ff 0%, #36cfc9 100%)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{ 
              color: 'white', 
              fontSize: '24px', 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              Travel Planner
            </div>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[activeTab]}
              onClick={({ key }) => setActiveTab(key)}
              style={{ 
                background: 'transparent',
                borderBottom: 'none'
              }}
            >
              <Menu.Item key="map" icon={<GlobalOutlined />}>Map View</Menu.Item>
              <Menu.Item key="spots" icon={<ShopOutlined />}>Spots</Menu.Item>
              <Menu.Item key="accommodations" icon={<HomeOutlined />}>Accommodations</Menu.Item>
              <Menu.Item key="transportation" icon={<CarOutlined />}>Transportation</Menu.Item>
            </Menu>
          </div>
          <div style={{ color: 'white' }}>
            <UserOutlined style={{ fontSize: '20px' }} />
          </div>
        </Header>
        <Content style={{ 
          padding: '0 50px', 
          marginTop: 64,
          background: '#f0f2f5'
        }}>
          <div style={{ 
            padding: '24px', 
            minHeight: 'calc(100vh - 64px - 70px)',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            {activeTab === 'map' && <MapView />}
            {activeTab === 'spots' && <SpotList />}
            {activeTab === 'accommodations' && <AccommodationList />}
            {activeTab === 'transportation' && <TransportationList />}
          </div>
        </Content>
        <Footer style={{ 
          textAlign: 'center',
          background: '#f0f2f5',
          padding: '16px 50px'
        }}>
          Travel Planner ©{new Date().getFullYear()} Created with ❤️
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App; 