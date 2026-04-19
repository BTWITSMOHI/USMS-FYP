# University Supervision Management System (USMS)

## Overview

The University Supervision Management System (USMS) is a full-stack web application designed to streamline the final-year project supervision process. The system connects students, supervisors, and administrators through a structured workflow that improves communication, transparency, and efficiency.

The platform allows students to submit project proposals, supervisors to review and manage them, and administrators to oversee and allocate supervision where necessary.

---

## Live System

Frontend: https://usms-fyp.vercel.app  
Backend: https://usms-backend.onrender.com  

---

## Features

### Authentication
- Role-based login system (Student, Supervisor, Admin)
- Secure password hashing
- JWT-based authentication
- Protected API routes

### Student Features
- Submit project proposals (title and description)
- Select a preferred supervisor or choose "Any Supervisor"
- View proposal status (pending, approved, rejected)
- View feedback from supervisors
- Chat with assigned supervisor after approval
- Delete pending proposals

### Supervisor Features
- View assigned proposals
- Accept or reject proposals
- Provide feedback on proposals
- Manage supervision capacity
- Communicate with students via messaging system

### Admin Features
- View all proposals in the system
- Identify unassigned proposals
- Assign supervisors to proposals
- Monitor supervisor workload
- Manage overall system activity

### Proposal Workflow
1. Student submits a proposal
2. If a preferred supervisor is selected, the proposal is sent directly
3. If "Any Supervisor" is selected, the proposal appears in the admin dashboard
4. Admin assigns a supervisor
5. Supervisor reviews and approves or rejects the proposal
6. Approved proposals enable communication between student and supervisor

### Messaging System
- Proposal-based messaging between student and supervisor
- Messages stored in the database
- Supports ongoing communication after approval

### Dashboard System
- Separate dashboards for each role
- Real-time data updates from backend
- Overview statistics (total, pending, approved proposals)
- Supervisor workload tracking

---

## Technology Stack

### Frontend
- React (Vite)
- TypeScript
- Material UI (MUI)
- Tailwind CSS

### Backend
- Node.js
- Fastify framework
- JWT authentication
- REST API architecture

### Database
- PostgreSQL
- Hosted on Render

### Deployment
- Frontend hosted on Vercel
- Backend hosted on Render
- Database hosted on Render

---

## System Architecture

The application follows a client-server architecture:

- Frontend communicates with backend via REST API
- Backend handles authentication, business logic, and database interaction
- PostgreSQL stores relational data (users, proposals, messages)

---

## API Endpoints

### Authentication
- POST /auth/register
- POST /auth/login
- GET /auth/me

### Proposals
- GET /proposals
- POST /proposals
- PATCH /proposals/:id/assign (admin)
- DELETE /proposals/:id

### Messaging
- GET /messages/:proposalId
- POST /messages

### Supervisors
- GET /supervisors

---

## Database Structure

### Users Table
Stores students, supervisors, and admins.

### Proposals Table
Stores project proposals and links students to supervisors.

### Messages Table
Stores communication between students and supervisors linked to proposals.

---

## Running Locally

### Clone the repository
```bash
git clone https://github.com/BTWITSMOHI/USMS-FYP.git
cd usms-fyp

Test

- [Introduction](intro.md)
- [Design](/guidelines/design.md)
- [Testing](/guidelines/test.md)
## Routes for testing 
