import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, InputNumber, message, Space, Tag, Tooltip, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, EnvironmentOutlined, DollarOutlined } from '@ant-design/icons';
import { theme } from 'antd';

const { Option } = Select;

const AccommodationList = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('name');
  const { token } = theme.useToken();

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const response = await fetch('http://localhost:5000/accommodations');
      const data = await response.json();
      setAccommodations(data);
    } catch (error) {
      message.error('Failed to fetch accommodations');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingAccommodation 
        ? `http://localhost:5000/accommodations/${editingAccommodation.id}`
        : 'http://localhost:5000/accommodations';
      
      const method = editingAccommodation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(editingAccommodation ? 'Accommodation updated successfully' : 'Accommodation added successfully');
        fetchAccommodations();
        setIsModalVisible(false);
        form.resetFields();
      } else {
        throw new Error('Failed to save accommodation');
      }
    } catch (error) {
      message.error('Failed to save accommodation');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/accommodations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Accommodation deleted successfully');
        fetchAccommodations();
      } else {
        throw new Error('Failed to delete accommodation');
      }
    } catch (error) {
      message.error('Failed to delete accommodation');
    }
  };

  const showModal = (accommodation = null) => {
    setEditingAccommodation(accommodation);
    if (accommodation) {
      form.setFieldsValue(accommodation);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const filteredAccommodations = accommodations
    .filter(acc => 
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(acc => 
      acc.price_per_night >= priceRange[0] && 
      acc.price_per_night <= priceRange[1]
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_asc':
          return a.price_per_night - b.price_per_night;
        case 'price_desc':
          return b.price_per_night - a.price_per_night;
        default:
          return 0;
      }
    });

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Add Accommodation
        </Button>
        <Space>
          <Input
            placeholder="Search accommodations..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 150 }}
          >
            <Option value="name">Sort by Name</Option>
            <Option value="price_asc">Price: Low to High</Option>
            <Option value="price_desc">Price: High to Low</Option>
          </Select>
        </Space>
      </Space>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '16px' 
      }}>
        {filteredAccommodations.map(acc => (
          <Card
            key={acc.id}
            hoverable
            style={{
              borderRadius: token.borderRadiusLG,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
            cover={
              <div style={{ 
                height: '200px', 
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HomeOutlined style={{ fontSize: '48px', color: token.colorPrimary }} />
              </div>
            }
            actions={[
              <Tooltip title="Edit">
                <EditOutlined key="edit" onClick={() => showModal(acc)} />
              </Tooltip>,
              <Tooltip title="Delete">
                <DeleteOutlined key="delete" onClick={() => handleDelete(acc.id)} />
              </Tooltip>
            ]}
          >
            <Card.Meta
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{acc.name}</span>
                  <Tag color="blue" icon={<DollarOutlined />}>
                    ${acc.price_per_night}/night
                  </Tag>
                </div>
              }
              description={
                <div>
                  <p style={{ marginBottom: '8px' }}>
                    <EnvironmentOutlined /> {acc.location}
                  </p>
                  {acc.description && (
                    <p style={{ color: token.colorTextSecondary }}>
                      {acc.description}
                    </p>
                  )}
                </div>
              }
            />
          </Card>
        ))}
      </div>

      <Modal
        title={editingAccommodation ? 'Edit Accommodation' : 'Add Accommodation'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the accommodation name!' }]}
          >
            <Input prefix={<HomeOutlined />} />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please input the location!' }]}
          >
            <Input prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Form.Item
            name="price_per_night"
            label="Price per Night"
            rules={[{ required: true, message: 'Please input the price per night!' }]}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }} 
              prefix={<DollarOutlined />}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingAccommodation ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccommodationList; 