import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const TransportationList = () => {
  const [transportations, setTransportations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransportation, setEditingTransportation] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTransportations();
  }, []);

  const fetchTransportations = async () => {
    try {
      const response = await fetch('http://localhost:5000/transportation');
      const data = await response.json();
      setTransportations(data);
    } catch (error) {
      message.error('Failed to fetch transportation options');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingTransportation 
        ? `http://localhost:5000/transportation/${editingTransportation.id}`
        : 'http://localhost:5000/transportation';
      
      const method = editingTransportation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          departure_time: values.departure_time.toISOString(),
          arrival_time: values.arrival_time.toISOString(),
        }),
      });

      if (response.ok) {
        message.success(editingTransportation ? 'Transportation updated successfully' : 'Transportation added successfully');
        fetchTransportations();
        setIsModalVisible(false);
        form.resetFields();
      } else {
        throw new Error('Failed to save transportation');
      }
    } catch (error) {
      message.error('Failed to save transportation');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/transportation/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Transportation deleted successfully');
        fetchTransportations();
      } else {
        throw new Error('Failed to delete transportation');
      }
    } catch (error) {
      message.error('Failed to delete transportation');
    }
  };

  const showModal = (transportation = null) => {
    setEditingTransportation(transportation);
    if (transportation) {
      form.setFieldsValue({
        ...transportation,
        departure_time: dayjs(transportation.departure_time),
        arrival_time: dayjs(transportation.arrival_time),
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Add Transportation
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {transportations.map(trans => (
          <Card
            key={trans.id}
            title={`${trans.type} from ${trans.from_location} to ${trans.to_location}`}
            actions={[
              <EditOutlined key="edit" onClick={() => showModal(trans)} />,
              <DeleteOutlined key="delete" onClick={() => handleDelete(trans.id)} />,
            ]}
          >
            <p><strong>Type:</strong> {trans.type}</p>
            <p><strong>From:</strong> {trans.from_location}</p>
            <p><strong>To:</strong> {trans.to_location}</p>
            <p><strong>Departure:</strong> {new Date(trans.departure_time).toLocaleString()}</p>
            <p><strong>Arrival:</strong> {new Date(trans.arrival_time).toLocaleString()}</p>
            <p><strong>Price:</strong> ${trans.price}</p>
          </Card>
        ))}
      </div>

      <Modal
        title={editingTransportation ? 'Edit Transportation' : 'Add Transportation'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select the transportation type!' }]}
          >
            <Select>
              <Option value="flight">Flight</Option>
              <Option value="train">Train</Option>
              <Option value="bus">Bus</Option>
              <Option value="car">Car</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="from_location"
            label="From Location"
            rules={[{ required: true, message: 'Please input the departure location!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="to_location"
            label="To Location"
            rules={[{ required: true, message: 'Please input the arrival location!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="departure_time"
            label="Departure Time"
            rules={[{ required: true, message: 'Please select the departure time!' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="arrival_time"
            label="Arrival Time"
            rules={[{ required: true, message: 'Please select the arrival time!' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please input the price!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingTransportation ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TransportationList; 