# System Guide – University Supervision Management System (USMS)

## Introduction

This document provides a guide to using the University Supervision Management System (USMS). The system is designed to support the management of final-year project supervision by enabling structured interaction between students, supervisors, and administrators.

---

## System Roles

The system supports three main user roles:

- Student
- Supervisor
- Administrator

Each role has specific responsibilities and access permissions within the system.

---

## Student Guide

### Creating an Account
Students can register by providing:
- Full name
- Email address
- Password
- Role (Student)

### Submitting a Proposal
Students can submit a project proposal by:
- Entering a project title
- Providing a project description
- Selecting a preferred supervisor or choosing "Any Supervisor"

### Proposal Status
Students can track their proposals with the following statuses:
- Pending
- Approved
- Rejected

If a proposal is rejected, feedback from the supervisor is displayed.

### Deleting a Proposal
Students can delete proposals only if they are still in the pending state.

### Communication
Once a proposal is approved, students can communicate with their assigned supervisor through the messaging system.

---

## Supervisor Guide

### Accessing Proposals
Supervisors can view all proposals assigned to them.

### Reviewing Proposals
Supervisors can:
- Approve proposals
- Reject proposals
- Provide feedback to students

### Managing Capacity
Supervisors have a defined maximum number of students they can supervise. The system tracks current supervision load.

### Communication
Supervisors can communicate with students linked to approved proposals.

---

## Administrator Guide

### Viewing Proposals
Administrators can view all proposals submitted within the system.

### Assigning Supervisors
For proposals submitted with the "Any Supervisor" option:
- The proposal appears in the admin dashboard
- The administrator assigns an available supervisor

### Monitoring Workload
Administrators can view:
- Number of students assigned to each supervisor
- Supervisor capacity

---

## Proposal Workflow

The system follows a structured workflow:

1. Student submits a proposal
2. If a preferred supervisor is selected:
   - Proposal is sent directly to that supervisor
3. If "Any Supervisor" is selected:
   - Proposal appears in the admin dashboard
4. Administrator assigns a supervisor
5. Supervisor reviews the proposal
6. Proposal is approved or rejected
7. Approved proposals enable communication between student and supervisor

---

## Messaging System

- Messages are linked to individual proposals
- Only the student and assigned supervisor can communicate
- Messages are stored in the database
- Communication is available only after proposal approval

---

## System Navigation

### Landing Page
- Provides an overview of the system
- Allows users to log in or create an account
- Includes demo account functionality

### Dashboards
Each role has a dedicated dashboard:

- Student Dashboard:
  - View proposals
  - Submit new proposals
  - Track status
  - Access messaging

- Supervisor Dashboard:
  - View assigned proposals
  - Review and manage proposals
  - Communicate with students

- Admin Dashboard:
  - View all proposals
  - Assign supervisors
  - Monitor system activity

---

## Error Handling

The system provides feedback for common issues, including:
- Invalid login credentials
- Missing required fields
- Unauthorized access attempts

---

## Deployment Information

The system is deployed as follows:

- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL (Render)

---

## Conclusion

The USMS provides a structured and efficient approach to managing final-year project supervision. By clearly separating roles and responsibilities, the system ensures effective communication, transparency, and streamlined workflow management.