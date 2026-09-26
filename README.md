# HopeLife Hospital Management System

A digital management system for hospitals and clinics to streamline patient records, doctor allocations, appointment booking, diagnosis records, and billing operations.

Built with a **Django REST API backend** (using Function-Based Views and raw SQL SQLite database queries) and a **premium, responsive glassmorphic frontend** integrating via the **Fetch API**.

---

## 🚀 Key Features

* **Patient Management**: Register new patients and maintain historical demographic profiles.
* **Doctor Management**: Organize department-wise specialists, view profiles, and set active consulting fees.
* **Appointment Booking**: Schedule checkup timeslots, select active doctor/patient entities, and track status.
* **Medical Records**: Log visit dates, clinical diagnoses, medical prescriptions, and treatment courses.
* **Billing & Invoicing**: Auto-generate totals based on consultation/medicine/lab fees, record payment methods, and instantly print professional physical invoices via the native print window.
* **Admin Dashboard**: Real-time operational KPI trackers (Total Patients, Doctors, Records, Revenue) alongside lists of today's schedules and recent activities.
* **Automatic Database Seeding**: Pre-loaded with the specified sample testing data immediately upon the first startup.

---

## 🛠 Technology Stack

* **Frontend**: HTML5 (Semantic Structure), CSS3 (Modern Variables, Flexbox/Grid layouts, Glassmorphism, Print Media Queries), JavaScript ES6 (Fetch API, DOM manipulation).
* **Backend**: Python 3.12, Django 5.0 (Function-Based Views, CSRF-Exempt API handlers, CORS support).
* **Database**: SQLite3 (Raw SQL operations, auto-initialized on launch).

---

## 📁 Directory Structure

```
HospitalManagementSystem/ (Workspace Root)
│── manage.py            # Django project entry point
│── README.md            # Project documentation
│── Backend/
│     settings.py        # Django configuration
│     db.py              # SQLite creation, CRUD SQL functions & seeding
│     views.py           # Django Function-Based View API controllers
│     urls.py            # API routes and Static file serving configurations
└── Frontend/
      index.html         # Hospital Landing Home Page
      patients.html      # Patient Registration & list
      doctors.html       # Doctor Profiles list & creation
      appointments.html  # Appointment Scheduler & ledger
      records.html       # Patient Diagnoses & prescriptions history
      billing.html       # Invoicing ledger & printable checkout slips
      dashboard.html     # Live operational metrics dashboard
      style.css          # Design system styling & print definitions
      script.js          # Fetch API calls, modals, toasts & UI state manager
```

---

## ⚙️ How to Run Locally

### 1. Prerequisite
Ensure **Python 3.12+** is installed on your system.

### 2. Verify Django Installation
Verify Django is installed or install it:
```bash
pip install django
```

### 3. Start the Server
Navigate to the project root directory and start Django's built-in development server:
```bash
python manage.py runserver
```

### 4. Access the Application
Open your web browser and navigate to:
```
http://127.0.0.1:8000
```
*(The backend serves the home page at the root route `/` and routes internal page requests seamlessly!)*

---

## 🔌 API Endpoints (20 CRUD APIs)

All API responses return JSON data with appropriate CORS headers (`Access-Control-Allow-Origin: *`).

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Patient** | `POST` | `/patients/add/` | Register a new patient (ID auto-starts at 101) |
| | `GET` | `/patients/` | Retrieve all registered patients |
| | `PUT` | `/patients/update/<id>/` | Update details of a specific patient |
| | `DELETE` | `/patients/delete/<id>/` | Delete a patient record |
| **Doctor** | `POST` | `/doctors/add/` | Add a doctor profile (ID auto-starts at 201) |
| | `GET` | `/doctors/` | Retrieve all doctor profiles |
| | `PUT` | `/doctors/update/<id>/` | Update details of a specific doctor |
| | `DELETE` | `/doctors/delete/<id>/` | Delete a doctor profile |
| **Appointment**| `POST` | `/appointments/add/` | Book a consultation slot (ID auto-starts at 301) |
| | `GET` | `/appointments/` | Retrieve all booked appointments |
| | `PUT` | `/appointments/update/<id>/` | Update details of an appointment |
| | `DELETE` | `/appointments/delete/<id>/` | Cancel & delete an appointment |
| **Medical Record**| `POST` | `/records/add/` | Log patient medical record (ID auto-starts at 401) |
| | `GET` | `/records/` | Retrieve all patient medical records |
| | `PUT` | `/records/update/<id>/` | Update details of a medical record |
| | `DELETE` | `/records/delete/<id>/` | Delete a medical record |
| **Billing** | `POST` | `/bills/add/` | Generate a new bill (ID auto-starts at 501) |
| | `GET` | `/bills/` | Retrieve all generated invoices |
| | `PUT` | `/bills/update/<id>/` | Update details of a specific bill |
| | `DELETE` | `/bills/delete/<id>/` | Delete a bill record |

---

## 🧪 Seeding & Testing Data

On the first launch of the server, the SQLite database is automatically created as `hms.db` in the project root. If the tables are empty, the backend will auto-seed the following sample testing data into the tables:

* **Patient**: Rahul Sharma (ID: 101, Hyderabad)
* **Doctor**: Dr. Priya Reddy (ID: 201, Cardiologist, Fee: 800)
* **Appointment**: Booked for Rahul Sharma with Dr. Priya Reddy on 2026-07-20 at 10:30 (Scheduled, ID: 301)
* **Medical Record**: Diagnosis of High Blood Pressure with Prescription "Tablet A - Once Daily" (ID: 401)
* **Bill**: Invoice generated for Rahul Sharma totaling ₹2500 (Paid via UPI, ID: 501)
