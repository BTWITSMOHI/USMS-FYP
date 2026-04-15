# University Supervision Management System - User Guide

## System Overview

A comprehensive web-based platform that streamlines the final-year project supervision process for universities. The system replaces manual processes (emails, spreadsheets, lost feedback) with a centralized, organized, and transparent solution.

## Features by User Role

### 🎓 Student Features

**Account & Authentication**
- Secure login and account creation
- Personalized dashboard

**Proposal Management**
- Submit project proposals with detailed descriptions
- Upload supporting documents (PDF, Word)
- Select preferred supervisor (optional)
- Real-time status tracking (Pending/Approved/Rejected)
- Receive mandatory written feedback on rejections
- View submission history

**Communication**
- Direct real-time chat with assigned supervisor
- File sharing within chat
- Persistent message history
- Meeting scheduling through chat

**Dashboard Insights**
- Total proposals submitted
- Approval statistics
- Quick access to all proposals and their statuses

---

### 👨‍🏫 Supervisor Features

**Proposal Review**
- View all assigned student proposals
- Download and review proposal documents
- Approve or reject proposals with one click
- Mandatory feedback requirement for rejections

**Student Management**
- Clear overview of all supervised students
- Categorized views (Pending/Approved/Rejected/All)
- Track review history and feedback provided

**Communication**
- Real-time chat with each student
- File sharing capabilities
- Organized by project for easy reference

**Workload Visibility**
- See current student count
- Track all active supervisions
- Quick filtering by proposal status

---

### 🧑‍💼 Administrator Features

**System-Wide Dashboard**
- Total proposals overview
- Pending, approved, and rejected counts
- Unassigned proposal tracking
- Key performance metrics (approval rate, response time)

**Supervisor Management**
- Real-time workload monitoring
- Visual progress bars showing capacity
- Supervisor expertise areas
- Current vs. maximum student allocation

**Proposal Assignment**
- Assign supervisors to unassigned proposals
- View supervisor availability
- Prevent overloading (capacity indicators)
- Override proposal statuses when needed

**Analytics & Insights**
- Total supervisors count
- Average response times
- System-wide approval rates
- Workload distribution visualization

---

## Demo Accounts

### Student Account
- **Email:** alice.w@student.edu
- **Password:** student123
- **Features:** Submit proposals, chat with supervisor

### Supervisor Account
- **Email:** j.smith@university.edu
- **Password:** supervisor123
- **Features:** Review proposals, provide feedback, manage students

### Admin Account
- **Email:** admin@university.edu
- **Password:** admin123
- **Features:** System oversight, supervisor assignment, analytics

---

## Complete User Workflows

### Student Workflow: Submitting a Proposal

1. **Login** to your student account
2. **Navigate** to "My Proposals" tab
3. **Click** "Create Proposal" button
4. **Fill in** proposal details:
   - Project title
   - Detailed description
   - Preferred supervisor (optional)
   - Upload document (optional, PDF/Word)
5. **Submit** and wait for review
6. **Check status** in dashboard:
   - Yellow badge = Pending review
   - Green badge = Approved (chat unlocked)
   - Red badge = Rejected (feedback provided)
7. **If approved:** Click "Chat with Supervisor" to begin communication
8. **If rejected:** Read feedback, revise, and resubmit

---

### Supervisor Workflow: Reviewing Proposals

1. **Login** to supervisor account
2. **View** pending proposals in "Pending" tab
3. **Click** on a proposal to read details
4. **Download** attached documents (if any)
5. **Decide:**
   - **Approve:** Click "Approve" → Add optional positive feedback → Submit
   - **Reject:** Click "Reject" → Add mandatory constructive feedback → Submit
6. **Access approved students** in "Approved" tab
7. **Click** "Open Chat" to communicate with students
8. **Monitor** all proposals in categorized tabs

---

### Admin Workflow: Managing the System

1. **Login** to admin account
2. **Monitor** dashboard overview:
   - Check pending proposals needing attention
   - Review supervisor workload distribution
   - Identify unassigned proposals
3. **Assign supervisors:**
   - Click "Assign Supervisor" on unassigned proposals
   - Select from available supervisors
   - View capacity indicators (green = available, red = at capacity)
4. **Override statuses** if needed using dropdown menus
5. **Track metrics:**
   - Approval rates
   - Response times
   - System health indicators

---

## Key Features Explained

### Real-Time Chat
- Persistent messaging between students and supervisors
- File attachments supported (max 5MB)
- Timestamped messages
- Role-based message styling
- Scroll to latest messages

### Proposal Status System
- **Pending (Yellow):** Awaiting supervisor or admin review
- **Approved (Green):** Project accepted, supervision active
- **Rejected (Red):** Needs revision, feedback provided

### Feedback Requirements
- **Rejections:** Mandatory detailed feedback explaining why and how to improve
- **Approvals:** Optional positive feedback and guidance
- **Student visibility:** All feedback displayed prominently

### Supervisor Capacity Management
- Visual workload indicators (progress bars)
- Color-coded capacity status:
  - Green: Under 80% capacity
  - Yellow: 80-99% capacity
  - Red: At or over capacity
- Prevents admin from assigning to overloaded supervisors

### File Management
- **Proposal documents:** PDF, Word (max 10MB)
- **Chat attachments:** Any file type (max 5MB)
- **Download capability:** All files downloadable
- **Preview:** File names and sizes displayed

---

## Best Practices

### For Students
- ✅ Provide detailed project descriptions
- ✅ Choose supervisors whose expertise matches your project
- ✅ Respond to supervisor messages promptly
- ✅ Read rejection feedback carefully before resubmitting
- ✅ Upload well-formatted proposal documents

### For Supervisors
- ✅ Review proposals within 5-7 business days
- ✅ Provide constructive, actionable feedback for rejections
- ✅ Maintain regular communication with approved students
- ✅ Keep chat responses professional and helpful
- ✅ Update students on project milestones

### For Administrators
- ✅ Monitor unassigned proposals daily
- ✅ Balance supervisor workloads evenly
- ✅ Match supervisor expertise to project topics
- ✅ Track system metrics weekly
- ✅ Intervene on stalled proposals

---

## Technical Notes

### Data Persistence
- All data stored locally in browser localStorage
- Survives page refreshes
- Independent per browser/device
- **Note:** Clearing browser data will reset the system

### Mock Backend
- Simulates API delays for realistic experience
- 500ms authentication delay
- 1000ms proposal submission delay
- Real-time state updates

### Responsive Design
- Optimized for desktop, tablet, and mobile
- Adaptive layouts
- Touch-friendly interfaces
- Mobile-first approach

---

## Troubleshooting

**Can't see my proposal?**
- Ensure you're logged in with the correct account
- Check if you submitted it successfully (look for success toast)
- Refresh the page

**Chat not loading?**
- Verify the proposal is approved
- Refresh the browser
- Check that you're on the correct proposal

**File upload failed?**
- Check file size (max 10MB for proposals, 5MB for chat)
- Ensure file format is supported (PDF, Word for proposals)
- Try a different file

**Feedback not showing?**
- Supervisors must save feedback when approving/rejecting
- Refresh to see latest updates
- Check in proposal details section

---

## Security & Privacy Note

This is a **demonstration prototype** designed for testing and evaluation purposes. For production use:

- ✅ Implement proper backend authentication (OAuth, JWT)
- ✅ Use secure database (PostgreSQL, MySQL)
- ✅ Add file encryption and virus scanning
- ✅ Implement role-based access control (RBAC)
- ✅ Comply with GDPR/FERPA for student data
- ✅ Add audit logging for all actions
- ✅ Use HTTPS for all communications
- ✅ Regular security audits

---

## Future Enhancements

Potential additions for a production system:

- 📧 Email notifications for status changes
- 📅 Integrated calendar for meeting scheduling
- 📊 Advanced analytics and reporting
- 🔔 Real-time push notifications
- 📱 Native mobile apps (iOS/Android)
- 🔍 Advanced search and filtering
- 📄 PDF generation for proposals
- 🏆 Progress tracking and milestones
- 💬 Group chat for committee reviews
- 🌐 Multi-language support
- ♿ Enhanced accessibility features
- 🎨 Customizable themes and branding

---

## Support

For questions or issues:
- Review this guide thoroughly
- Check demo accounts for examples
- Test all three user roles to understand full workflow
- Note that this is a prototype for demonstration purposes

---

**Built with:** React, TypeScript, Tailwind CSS, shadcn/ui components
**Version:** 1.0.0
**Last Updated:** February 3, 2026
