mport sqlite3
import os
from django.conf import settings

def get_db_connection():
    db_path = os.path.join(settings.BASE_DIR, 'hms.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Patient Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            patient_id INTEGER PRIMARY KEY,
            patient_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            blood_group TEXT NOT NULL,
            address TEXT NOT NULL
        )
    """)
    
    # Doctor Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS doctors (
            doctor_id INTEGER PRIMARY KEY,
            doctor_name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            department TEXT NOT NULL,
            experience INTEGER NOT NULL,
            phone TEXT NOT NULL,
            consultation_fee REAL NOT NULL
        )
    """)
    
    # Appointment Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            appointment_id INTEGER PRIMARY KEY,
            patient_name TEXT NOT NULL,
            doctor_name TEXT NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            appointment_status TEXT NOT NULL
        )
    """)
    
    # Medical Record Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS records (
            record_id INTEGER PRIMARY KEY,
            patient_name TEXT NOT NULL,
            doctor_name TEXT NOT NULL,
            diagnosis TEXT NOT NULL,
            prescription TEXT NOT NULL,
            treatment TEXT NOT NULL,
            visit_date TEXT NOT NULL
        )
    """)
    
    # Billing Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bills (
            bill_id INTEGER PRIMARY KEY,
            patient_name TEXT NOT NULL,
            consultation_fee REAL NOT NULL,
            medicine_charge REAL NOT NULL,
            laboratory_charge REAL NOT NULL,
            total_amount REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL
        )
    """)
    
    conn.commit()
    
    # Auto-seed sample testing data if the database is empty
    cursor.execute("SELECT COUNT(*) FROM patients")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO patients (patient_id, patient_name, age, gender, phone, email, blood_group, address)
            VALUES (101, 'Rahul Sharma', 28, 'Male', '9876543210', 'rahul@gmail.com', 'O+', 'Hyderabad')
        """)
        cursor.execute("""
            INSERT INTO doctors (doctor_id, doctor_name, specialization, department, experience, phone, consultation_fee)
            VALUES (201, 'Dr. Priya Reddy', 'Cardiologist', 'Cardiology', 10, '9988776655', 800)
        """)
        cursor.execute("""
            INSERT INTO appointments (appointment_id, patient_name, doctor_name, appointment_date, appointment_time, appointment_status)
            VALUES (301, 'Rahul Sharma', 'Dr. Priya Reddy', '2026-07-20', '10:30', 'Scheduled')
        """)
        cursor.execute("""
            INSERT INTO records (record_id, patient_name, doctor_name, diagnosis, prescription, treatment, visit_date)
            VALUES (401, 'Rahul Sharma', 'Dr. Priya Reddy', 'High Blood Pressure', 'Tablet A - Once Daily', 'Regular Monitoring', '2026-07-20')
        """)
        cursor.execute("""
            INSERT INTO bills (bill_id, patient_name, consultation_fee, medicine_charge, laboratory_charge, total_amount, payment_method, payment_status)
            VALUES (501, 'Rahul Sharma', 800, 1200, 500, 2500, 'UPI', 'Paid')
        """)
        conn.commit()
        
    conn.close()

# ID Auto-increment starters (conforming to sample testing data specifications)
def get_next_patient_id(cursor):
    cursor.execute("SELECT COALESCE(MAX(patient_id), 100) + 1 FROM patients")
    return cursor.fetchone()[0]

def get_next_doctor_id(cursor):
    cursor.execute("SELECT COALESCE(MAX(doctor_id), 200) + 1 FROM doctors")
    return cursor.fetchone()[0]

def get_next_appointment_id(cursor):
    cursor.execute("SELECT COALESCE(MAX(appointment_id), 300) + 1 FROM appointments")
    return cursor.fetchone()[0]

def get_next_record_id(cursor):
    cursor.execute("SELECT COALESCE(MAX(record_id), 400) + 1 FROM records")
    return cursor.fetchone()[0]

def get_next_bill_id(cursor):
    cursor.execute("SELECT COALESCE(MAX(bill_id), 500) + 1 FROM bills")
    return cursor.fetchone()[0]

# --- PATIENT CRUD ---
def get_patients():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_patient(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    p_id = data.get('patient_id')
    if not p_id:
        p_id = get_next_patient_id(cursor)
    cursor.execute("""
        INSERT INTO patients (patient_id, patient_name, age, gender, phone, email, blood_group, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        p_id,
        data['patient_name'],
        int(data['age']),
        data['gender'],
        data['phone'],
        data['email'],
        data['blood_group'],
        data['address']
    ))
    conn.commit()
    cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (p_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_patient(patient_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE patients
        SET patient_name = ?, age = ?, gender = ?, phone = ?, email = ?, blood_group = ?, address = ?
        WHERE patient_id = ?
    """, (
        data['patient_name'],
        int(data['age']),
        data['gender'],
        data['phone'],
        data['email'],
        data['blood_group'],
        data['address'],
        patient_id
    ))
    conn.commit()
    cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (patient_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_patient(patient_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM patients WHERE patient_id = ?", (patient_id,))
    conn.commit()
    conn.close()

# --- DOCTOR CRUD ---
def get_doctors():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM doctors")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_doctor(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    d_id = data.get('doctor_id')
    if not d_id:
        d_id = get_next_doctor_id(cursor)
    cursor.execute("""
        INSERT INTO doctors (doctor_id, doctor_name, specialization, department, experience, phone, consultation_fee)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        d_id,
        data['doctor_name'],
        data['specialization'],
        data['department'],
        int(data['experience']),
        data['phone'],
        float(data['consultation_fee'])
    ))
    conn.commit()
    cursor.execute("SELECT * FROM doctors WHERE doctor_id = ?", (d_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_doctor(doctor_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE doctors
        SET doctor_name = ?, specialization = ?, department = ?, experience = ?, phone = ?, consultation_fee = ?
        WHERE doctor_id = ?
    """, (
        data['doctor_name'],
        data['specialization'],
        data['department'],
        int(data['experience']),
        data['phone'],
        float(data['consultation_fee']),
        doctor_id
    ))
    conn.commit()
    cursor.execute("SELECT * FROM doctors WHERE doctor_id = ?", (doctor_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_doctor(doctor_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM doctors WHERE doctor_id = ?", (doctor_id,))
    conn.commit()
    conn.close()

# --- APPOINTMENT CRUD ---
def get_appointments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_appointment(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    a_id = data.get('appointment_id')
    if not a_id:
        a_id = get_next_appointment_id(cursor)
    cursor.execute("""
        INSERT INTO appointments (appointment_id, patient_name, doctor_name, appointment_date, appointment_time, appointment_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        a_id,
        data['patient_name'],
        data['doctor_name'],
        data['appointment_date'],
        data['appointment_time'],
        data['appointment_status']
    ))
    conn.commit()
    cursor.execute("SELECT * FROM appointments WHERE appointment_id = ?", (a_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_appointment(appointment_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE appointments
        SET patient_name = ?, doctor_name = ?, appointment_date = ?, appointment_time = ?, appointment_status = ?
        WHERE appointment_id = ?
    """, (
        data['patient_name'],
        data['doctor_name'],
        data['appointment_date'],
        data['appointment_time'],
        data['appointment_status'],
        appointment_id
    ))
    conn.commit()
    cursor.execute("SELECT * FROM appointments WHERE appointment_id = ?", (appointment_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_appointment(appointment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM appointments WHERE appointment_id = ?", (appointment_id,))
    conn.commit()
    conn.close()

# --- MEDICAL RECORD CRUD ---
def get_records():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM records")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_record(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    r_id = data.get('record_id')
    if not r_id:
        r_id = get_next_record_id(cursor)
    cursor.execute("""
        INSERT INTO records (record_id, patient_name, doctor_name, diagnosis, prescription, treatment, visit_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        r_id,
        data['patient_name'],
        data['doctor_name'],
        data['diagnosis'],
        data['prescription'],
        data['treatment'],
        data['visit_date']
    ))
    conn.commit()
    cursor.execute("SELECT * FROM records WHERE record_id = ?", (r_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_record(record_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE records
        SET patient_name = ?, doctor_name = ?, diagnosis = ?, prescription = ?, treatment = ?, visit_date = ?
        WHERE record_id = ?
    """, (
        data['patient_name'],
        data['doctor_name'],
        data['diagnosis'],
        data['prescription'],
        data['treatment'],
        data['visit_date'],
        record_id
    ))
    conn.commit()
    cursor.execute("SELECT * FROM records WHERE record_id = ?", (record_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_record(record_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM records WHERE record_id = ?", (record_id,))
    conn.commit()
    conn.close()

# --- BILLING CRUD ---
def get_bills():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bills")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_bill(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    b_id = data.get('bill_id')
    if not b_id:
        b_id = get_next_bill_id(cursor)
    
    # Auto-calculate total amount
    c_fee = float(data.get('consultation_fee', 0))
    m_fee = float(data.get('medicine_charge', 0))
    l_fee = float(data.get('laboratory_charge', 0))
    total = c_fee + m_fee + l_fee
    
    cursor.execute("""
        INSERT INTO bills (bill_id, patient_name, consultation_fee, medicine_charge, laboratory_charge, total_amount, payment_method, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        b_id,
        data['patient_name'],
        c_fee,
        m_fee,
        l_fee,
        total,
        data['payment_method'],
        data['payment_status']
    ))
    conn.commit()
    cursor.execute("SELECT * FROM bills WHERE bill_id = ?", (b_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_bill(bill_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Auto-calculate total amount
    c_fee = float(data.get('consultation_fee', 0))
    m_fee = float(data.get('medicine_charge', 0))
    l_fee = float(data.get('laboratory_charge', 0))
    total = c_fee + m_fee + l_fee
    
    cursor.execute("""
        UPDATE bills
        SET patient_name = ?, consultation_fee = ?, medicine_charge = ?, laboratory_charge = ?, total_amount = ?, payment_method = ?, payment_status = ?
        WHERE bill_id = ?
    """, (
        data['patient_name'],
        c_fee,
        m_fee,
        l_fee,
        total,
        data['payment_method'],
        data['payment_status'],
        bill_id
    ))
    conn.commit()
    cursor.execute("SELECT * FROM bills WHERE bill_id = ?", (bill_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_bill(bill_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bills WHERE bill_id = ?", (bill_id,))
    conn.commit()
    conn.close()

# Auto-initialize database tables when this module is imported
init_db()

