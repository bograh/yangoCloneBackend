# React Native Taxi Booking Application

## Overview

This document provides instructions for integrating the Taxi Booking API with a React Native application. The API enables users to create bookings, retrieve booking details, and submit feedback.

## Setup

### Prerequisites

- Node.js
- React Native CLI
- Firebase setup
- Postman or Thunder Client VS Code Extension

### Installing Dependencies

1. **Clone the Repository**
    ```bash
    git clone https://github.com/officialjwise/yangoCloneBackend.git
    cd taxi-booking-app
    ```

2. **Install Node Modules**
    ```bash
    npm install
    ```

3. **Link Dependencies**
    ```bash
    npx react-native link
    ```

## API Endpoints

### 1. Create a Booking

- **Endpoint:** `POST /bookings/book/:userId/:driverId`
- **Description:** Create a new booking by providing `userId` and `driverId` as URL parameters, and `userLocation` in the request body.
- **Request:**
  - **URL:** `http://localhost:3000/bookings/book/{userId}/{driverId}`
  - **Method:** POST
  - **Headers:** 
    ```json
    {
      "Content-Type": "application/json"
    }
    ```
  - **Body:**
    ```json
    {
      "userLocation": {
        "lat": 37.7749,
        "lng": -122.4194
      }
    }
    ```
  - **Response:**
    - **Success:**
      ```json
      {
        "message": "Booking confirmed",
        "bookingId": "abc123"
      }
      ```
    - **Error:**
      ```json
      {
        "error": "User location not found"
      }
      ```

### 2. Get Booking by ID

- **Endpoint:** `GET /bookings/:bookingId`
- **Description:** Retrieve details of a specific booking using the `bookingId`.
- **Request:**
  - **URL:** `http://localhost:3000/bookings/{bookingId}`
  - **Method:** GET
  - **Response:**
    - **Success:**
      ```json
      {
        "id": "abc123",
        "pickupLocation": {
          "lat": 37.7749,
          "lng": -122.4194
        },
        "status": "pending",
        "driverId": "driver123",
        "userId": "user123",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
      ```
    - **Error:**
      ```json
      "Booking not found"
      ```

### 3. Get All Bookings

- **Endpoint:** `GET /bookings`
- **Description:** Get a list of all bookings.
- **Request:**
  - **URL:** `http://localhost:3000/bookings`
  - **Method:** GET
  - **Response:**
    - **Success:**
      ```json
      [
        {
          "id": "abc123",
          "pickupLocation": {
            "lat": 37.7749,
            "lng": -122.4194
          },
          "status": "pending",
          "driverId": "driver123",
          "userId": "user123",
          "createdAt": "timestamp",
          "updatedAt": "timestamp"
        }
      ]
      ```

### 4. Submit Feedback

- **Endpoint:** `POST /feedback`
- **Description:** Submit feedback for a specific booking.
- **Request:**
  - **URL:** `http://localhost:3000/feedback`
  - **Method:** POST
  - **Headers:**
    ```json
    {
      "Content-Type": "application/json"
    }
    ```
  - **Body:**
    ```json
    {
      "bookingId": "abc123",
      "rating": 5,
      "comment": "Excellent service"
    }
    ```
  - **Response:**
    - **Success:**
      ```json
      {
        "message": "Feedback submitted successfully"
      }
      ```
    - **Error:**
      ```json
      "Booking not found"
      ```

### 5. Get Feedback for a Booking

- **Endpoint:** `GET /feedback/:bookingId`
- **Description:** Retrieve feedback for a specific booking.
- **Request:**
  - **URL:** `http://localhost:3000/feedback/{bookingId}`
  - **Method:** GET
  - **Response:**
    - **Success:**
      ```json
      {
        "feedback": [
          {
            "id": "feedback123",
            "bookingId": "abc123",
            "rating": 5,
            "comment": "Excellent service",
            "timestamp": "timestamp"
          }
        ]
      }
      ```
    - **Error:**
      ```json
      "Booking not found"
      ```

## React Native Integration

### 1. Setting Up Axios

Install Axios to handle HTTP requests:

```bash
npm install axios

# API Service Integration

## 1. Create API Service

Create a file named `apiService.js` to handle API calls:

```javascript
import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a booking
export const createBooking = async (userId, driverId, userLocation) => {
  try {
    const response = await api.post(`/bookings/book/${userId}/${driverId}`, {
      userLocation,
    });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.error || error.message };
  }
};

// Get booking by ID
export const getBooking = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.error || error.message };
  }
};

// Get all bookings
export const getAllBookings = async () => {
  try {
    const response = await api.get('/bookings');
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.error || error.message };
  }
};

// Submit feedback
export const submitFeedback = async (bookingId, rating, comment) => {
  try {
    const response = await api.post('/feedback', {
      bookingId,
      rating,
      comment,
    });
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.error || error.message };
  }
};

// Get feedback for a booking
export const getFeedbackForBooking = async (bookingId) => {
  try {
    const response = await api.get(`/feedback/${bookingId}`);
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.error || error.message };
  }
};

# Using API in Components

## Example: Booking Screen Component

This section provides an example of how to use the API services in a React Native component.

### Code Example

Create a file named `BookingScreen.js` with the following content:

```javascript
import React, { useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { createBooking, getBooking, submitFeedback } from './apiService';

const BookingScreen = () => {
  const [userId, setUserId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: '', lng: '' });
  const [response, setResponse] = useState('');

  const handleCreateBooking = async () => {
    const result = await createBooking(userId, driverId, userLocation);
    setResponse(JSON.stringify(result));
  };

  const handleGetBooking = async (bookingId) => {
    const result = await getBooking(bookingId);
    setResponse(JSON.stringify(result));
  };

  const handleSubmitFeedback = async (bookingId, rating, comment) => {
    const result = await submitFeedback(bookingId, rating, comment);
    setResponse(JSON.stringify(result));
  };

  return (
    <View>
      <TextInput
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
      />
      <TextInput
        placeholder="Driver ID"
        value={driverId}
        onChangeText={setDriverId}
      />
      <TextInput
        placeholder="Latitude"
        value={userLocation.lat}
        onChangeText={(lat) => setUserLocation({ ...userLocation, lat })}
      />
      <TextInput
        placeholder="Longitude"
        value={userLocation.lng}
        onChangeText={(lng) => setUserLocation({ ...userLocation, lng })}
      />
      <Button title="Create Booking" onPress={handleCreateBooking} />
      <Text>{response}</Text>
    </View>
  );
};

export default BookingScreen;


**Conclusion**

This example demonstrates how to integrate the In Drive Clone Booking API services into a React Native component. Ensure your backend server is running and accessible from your React Native application for successful API interactions. For additional customization, refer to the specific API documentation and adjust the code as needed.