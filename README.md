# Social Media Microservices Project Documentation

## Overview

This project showcases a microservices architecture for a social media application. It demonstrates:

- **Database Per Service** pattern
- **Asynchronous Messaging** using **RabbitMQ**
- **Aggregator Pattern** for cross-service data composition

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (one per service)
- **Messaging Queue:** RabbitMQ
- **API Testing & Docs:** Thunder Client (VSCode extension)

## Services

- **User Service**: Manages user registration and data
- **Post Service**: Handles posts created by users
- **Comment Service**: Manages comments on posts
- **Aggregator Service**: Aggregates user, post, and comment data from other services

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Jai899061/social-media-microservice-activity.git
```

### 2. Install Dependencies for Each Service

```bash
cd aggregator-service && npm install
cd ../comment-service && npm install
cd ../user-service && npm install
cd ../post-service && npm install
```

### 3. Start RabbitMQ and MongoDB via Docker

```bash
docker-compose up
```

---

## Configuration

### Environment Variables

Each service reads configuration from `.env` or `index.js`. Key variables include:

- `PORT`: Port number for the service
- `MONGODB_URI`: MongoDB connection string
- `RABBITMQ_URL`: RabbitMQ connection URL
- `POST_SERVICE_URL`, `USER_SERVICE_URL`, `COMMENT_SERVICE_URL`: Used in Aggregator Service only

> **Note:** Ensure these URLs are properly set in the aggregator service to allow it to reach other services.

### .gitignore

Ensures the following are ignored:

- `.env`
- `node_modules/`
- `dist/` or build folders

---

## Running the Services

Start each service independently:

```bash
cd aggregator-service && npm start
cd ../comment-service && npm start
cd ../user-service && npm start
cd ../post-service && npm start
```

---

## RabbitMQ Usage

### Libraries

- Uses `amqplib` as the Node.js RabbitMQ client

### Purpose

- Services use RabbitMQ to communicate asynchronously
- Common events include:

  - Post creation
  - User registration
  - Comment submission

### Aggregator Service Note

- Aggregator **does not** directly use RabbitMQ
- It **only performs HTTP requests** to fetch data from other services

---

## API Documentation

Each service contains an `api-doc/` folder compatible with **Thunder Client**. Import into the Thunder Client VSCode extension to test API endpoints directly.

---

## Summary

This microservices-based project integrates key architectural patterns with modern backend technologies:

- Independent services with dedicated databases
- Decoupled communication via RabbitMQ
- Composition of data using Aggregator pattern

Ideal for understanding scalable and maintainable backend system design in Node.js.
