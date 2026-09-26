// Base API configuration. Points to local Django backend
const API_BASE = window.location.origin.startsWith('file://') ? 'http://127.0.0.1:8000' : window.location.origin;

// Toast Notifications System
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    
    toast.innerHTML = `<i class="fas ${iconClass}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Fetch API Wrapper
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (response.status === 204) return {};
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Server error occurred');
        }
        return data;
    } catch (err) {
        showToast(err.message, 'error');
        throw err;
    }
}

// App Routing Init on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    // Determine active page in Navbar
    const path = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links li');
    navItems.forEach(li => {
        const link = li.querySelector('a');
        if (link && path.includes(link.getAttribute('href'))) {
            navItems.forEach(n => n.classList.remove('active'));
            li.classList.add('active');
        }
    });

    // Page-specific initializers
    if (document.getElementById('patient-form-card')) {
        initPatientsPage();
    } else if (document.getElementById('doctor-grid')) {
        initDoctorsPage();
    } else if (document.getElementById('appointment-form-card')) {
        initAppointmentsPage();
    } else if (document.getElementById('record-form-card')) {
        initRecordsPage();
    } else if (document.getElementById('bill-form-card')) {
        initBillingPage();
    } else if (document.getElementById('dashboard-stats')) {
        initDashboardPage();
    }
});

// ==========================================
// 1. PATIENTS PAGE LOGIC
// ==========================================
function initPatientsPage() {
    const form = document.getElementById('patient-form');
    const tableBody = document.getElementById('patient-table-body');
    const cancelBtn = document.getElementById('cancel-patient-edit');
    const formTitle = document.getElementById('patient-form-title');

    // Load patients
    async function loadPatients() {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Loading patients...</td></tr>';
        try {
            const patients = await apiCall('/patients/');
            tableBody.innerHTML = '';
            if (patients.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No patients registered yet.</td></tr>';
                return;
            }
            patients.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${p.patient_id}</strong></td>
                    <td>${p.patient_name}</td>
                    <td>${p.age}</td>
                    <td><span class="badge badge-info">${p.gender}</span></td>
                    <td>${p.phone}</td>
                    <td>${p.email}</td>
                    <td><span class="badge badge-success">${p.blood_group}</span></td>
                    <td>${p.address}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm edit-p-btn" data-id="${p.patient_id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm delete-p-btn" data-id="${p.patient_id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Attach event listeners
            document.querySelectorAll('.edit-p-btn').forEach(btn => {
                btn.addEventListener('click', () => editPatient(btn.dataset.id, patients));
            });
            document.querySelectorAll('.delete-p-btn').forEach(btn => {
                btn.addEventListener('click', () => deletePatient(btn.dataset.id));
            });
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:var(--accent-rose);">Failed to load patients.</td></tr>';
        }
    }

    // Submit patient (Add/Update)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pId = document.getElementById('patient-id').value;
        const patientData = {
            patient_name: document.getElementById('patient-name').value,
            age: parseInt(document.getElementById('patient-age').value),
            gender: document.getElementById('patient-gender').value,
            phone: document.getElementById('patient-phone').value,
            email: document.getElementById('patient-email').value,
            blood_group: document.getElementById('patient-blood-group').value,
            address: document.getElementById('patient-address').value
        };

        try {
            if (pId) {
                // Update
                await apiCall(`/patients/update/${pId}/`, 'PUT', patientData);
                showToast('Patient details updated successfully!', 'success');
            } else {
                // Add
                await apiCall('/patients/add/', 'POST', patientData);
                showToast('Patient registered successfully!', 'success');
            }
            resetPatientForm();
            loadPatients();
        } catch (e) {}
    });

    function editPatient(id, list) {
        const patient = list.find(p => p.patient_id == id);
        if (!patient) return;

        document.getElementById('patient-id').value = patient.patient_id;
        document.getElementById('patient-name').value = patient.patient_name;
        document.getElementById('patient-age').value = patient.age;
        document.getElementById('patient-gender').value = patient.gender;
        document.getElementById('patient-phone').value = patient.phone;
        document.getElementById('patient-email').value = patient.email;
        document.getElementById('patient-blood-group').value = patient.blood_group;
        document.getElementById('patient-address').value = patient.address;

        formTitle.textContent = `Update Patient #${id}`;
        cancelBtn.style.display = 'inline-flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function deletePatient(id) {
        if (confirm(`Are you sure you want to delete patient #${id}?`)) {
            try {
                await apiCall(`/patients/delete/${id}/`, 'DELETE');
                showToast('Patient deleted successfully!', 'success');
                loadPatients();
            } catch (e) {}
        }
    }

    function resetPatientForm() {
        form.reset();
        document.getElementById('patient-id').value = '';
        formTitle.textContent = 'Register New Patient';
        cancelBtn.style.display = 'none';
    }

    cancelBtn.addEventListener('click', resetPatientForm);
    loadPatients();
}

// ==========================================
// 2. DOCTORS PAGE LOGIC
// ==========================================
function initDoctorsPage() {
    const grid = document.getElementById('doctor-grid');
    const form = document.getElementById('doctor-form');
    const modal = document.getElementById('doctor-modal');
    const openModalBtn = document.getElementById('open-doctor-modal');
    const closeModalBtn = document.getElementById('close-doctor-modal');
    const formTitle = document.getElementById('doctor-form-title');
    const dIdInput = document.getElementById('doctor-id');

    async function loadDoctors() {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:2rem;">Loading doctors...</div>';
        try {
            const doctors = await apiCall('/doctors/');
            grid.innerHTML = '';
            if (doctors.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:2rem;">No doctors registered yet.</div>';
                return;
            }
            doctors.forEach(d => {
                const card = document.createElement('div');
                card.className = 'card doctor-card';
                card.innerHTML = `
                    <div class="doctor-avatar">
                        <i class="fas fa-user-md"></i>
                    </div>
                    <span class="doctor-specialization">${d.specialization}</span>
                    <h3>${d.doctor_name}</h3>
                    <p style="color:var(--text-secondary); font-size:0.875rem; margin-bottom: 0.75rem;">Department: ${d.department}</p>
                    
                    <div class="doctor-detail-item">
                        <i class="fas fa-briefcase"></i> Experience: ${d.experience} Years
                    </div>
                    <div class="doctor-detail-item">
                        <i class="fas fa-phone"></i> ${d.phone}
                    </div>
                    <div class="doctor-detail-item" style="font-weight: 600; color:var(--text-primary); margin-top:0.5rem;">
                        <i class="fas fa-money-bill-wave"></i> Fee: ₹${d.consultation_fee}
                    </div>
                    
                    <div class="doctor-actions">
                        <button class="btn btn-secondary btn-sm edit-d-btn" data-id="${d.doctor_id}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-danger btn-sm delete-d-btn" data-id="${d.doctor_id}"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                `;
                grid.appendChild(card);
            });

            document.querySelectorAll('.edit-d-btn').forEach(btn => {
                btn.addEventListener('click', () => editDoctor(btn.dataset.id, doctors));
            });
            document.querySelectorAll('.delete-d-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteDoctor(btn.dataset.id));
            });
        } catch (e) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:var(--accent-rose); padding:2rem;">Failed to load doctors.</div>';
        }
    }

    openModalBtn.addEventListener('click', () => {
        formTitle.textContent = 'Add New Doctor';
        dIdInput.value = '';
        form.reset();
        modal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = dIdInput.value;
        const doctorData = {
            doctor_name: document.getElementById('doctor-name').value,
            specialization: document.getElementById('doctor-specialization').value,
            department: document.getElementById('doctor-department').value,
            experience: parseInt(document.getElementById('doctor-experience').value),
            phone: document.getElementById('doctor-phone').value,
            consultation_fee: parseFloat(document.getElementById('doctor-fee').value)
        };

        try {
            if (id) {
                await apiCall(`/doctors/update/${id}/`, 'PUT', doctorData);
                showToast('Doctor profile updated successfully!', 'success');
            } else {
                await apiCall('/doctors/add/', 'POST', doctorData);
                showToast('Doctor profile created successfully!', 'success');
            }
            modal.style.display = 'none';
            loadDoctors();
        } catch (e) {}
    });

    function editDoctor(id, list) {
        const d = list.find(doc => doc.doctor_id == id);
        if (!d) return;

        dIdInput.value = d.doctor_id;
        document.getElementById('doctor-name').value = d.doctor_name;
        document.getElementById('doctor-specialization').value = d.specialization;
        document.getElementById('doctor-department').value = d.department;
        document.getElementById('doctor-experience').value = d.experience;
        document.getElementById('doctor-phone').value = d.phone;
        document.getElementById('doctor-fee').value = d.consultation_fee;

        formTitle.textContent = `Update Doctor #${id}`;
        modal.style.display = 'block';
    }

    async function deleteDoctor(id) {
        if (confirm(`Are you sure you want to delete doctor profile #${id}?`)) {
            try {
                await apiCall(`/doctors/delete/${id}/`, 'DELETE');
                showToast('Doctor deleted successfully!', 'success');
                loadDoctors();
            } catch (e) {}
        }
    }

    loadDoctors();
}

// ==========================================
// 3. APPOINTMENTS PAGE LOGIC
// ==========================================
function initAppointmentsPage() {
    const form = document.getElementById('appointment-form');
    const tableBody = document.getElementById('appointment-table-body');
    const cancelBtn = document.getElementById('cancel-appointment-edit');
    const formTitle = document.getElementById('appointment-form-title');
    const patientSelect = document.getElementById('patient-name');
    const doctorSelect = document.getElementById('doctor-name');

    // Populate patient and doctor dropdown lists dynamically
    async function loadDropdowns() {
        try {
            const patients = await apiCall('/patients/');
            const doctors = await apiCall('/doctors/');

            patientSelect.innerHTML = '<option value="">-- Choose Patient --</option>';
            patients.forEach(p => {
                patientSelect.innerHTML += `<option value="${p.patient_name}">${p.patient_name} (ID: ${p.patient_id})</option>`;
            });

            doctorSelect.innerHTML = '<option value="">-- Choose Doctor --</option>';
            doctors.forEach(d => {
                doctorSelect.innerHTML += `<option value="${d.doctor_name}">${d.doctor_name} (${d.specialization})</option>`;
            });
        } catch (e) {
            showToast('Failed to load doctor or patient information.', 'error');
        }
    }

    // Load appointments
    async function loadAppointments() {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading appointments...</td></tr>';
        try {
            const list = await apiCall('/appointments/');
            tableBody.innerHTML = '';
            if (list.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No appointments booked yet.</td></tr>';
                return;
            }
            list.forEach(a => {
                let badgeClass = 'badge-warning';
                if (a.appointment_status === 'Completed') badgeClass = 'badge-success';
                if (a.appointment_status === 'Cancelled') badgeClass = 'badge-danger';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${a.appointment_id}</strong></td>
                    <td>${a.patient_name}</td>
                    <td>${a.doctor_name}</td>
                    <td>${a.appointment_date}</td>
                    <td>${a.appointment_time}</td>
                    <td><span class="badge ${badgeClass}">${a.appointment_status}</span></td>
                    <td>
                        <button class="btn btn-secondary btn-sm edit-a-btn" data-id="${a.appointment_id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm delete-a-btn" data-id="${a.appointment_id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            document.querySelectorAll('.edit-a-btn').forEach(btn => {
                btn.addEventListener('click', () => editAppointment(btn.dataset.id, list));
            });
            document.querySelectorAll('.delete-a-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteAppointment(btn.dataset.id));
            });
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--accent-rose);">Failed to load appointments.</td></tr>';
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const aId = document.getElementById('appointment-id').value;
        const appData = {
            patient_name: patientSelect.value,
            doctor_name: doctorSelect.value,
            appointment_date: document.getElementById('appointment-date').value,
            appointment_time: document.getElementById('appointment-time').value,
            appointment_status: document.getElementById('appointment-status').value
        };

        if (!appData.patient_name || !appData.doctor_name) {
            showToast('Please select both a patient and a doctor.', 'warning');
            return;
        }

        try {
            if (aId) {
                await apiCall(`/appointments/update/${aId}/`, 'PUT', appData);
                showToast('Appointment updated successfully!', 'success');
            } else {
                await apiCall('/appointments/add/', 'POST', appData);
                showToast('Appointment booked successfully!', 'success');
            }
            resetAppointmentForm();
            loadAppointments();
        } catch (e) {}
    });

    function editAppointment(id, list) {
        const a = list.find(item => item.appointment_id == id);
        if (!a) return;

        document.getElementById('appointment-id').value = a.appointment_id;
        patientSelect.value = a.patient_name;
        doctorSelect.value = a.doctor_name;
        document.getElementById('appointment-date').value = a.appointment_date;
        document.getElementById('appointment-time').value = a.appointment_time;
        document.getElementById('appointment-status').value = a.appointment_status;

        formTitle.textContent = `Update Appointment #${id}`;
        cancelBtn.style.display = 'inline-flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function deleteAppointment(id) {
        if (confirm(`Are you sure you want to cancel and delete appointment #${id}?`)) {
            try {
                await apiCall(`/appointments/delete/${id}/`, 'DELETE');
                showToast('Appointment deleted successfully!', 'success');
                loadAppointments();
            } catch (e) {}
        }
    }

    function resetAppointmentForm() {
        form.reset();
        document.getElementById('appointment-id').value = '';
        formTitle.textContent = 'Book Appointment';
        cancelBtn.style.display = 'none';
    }

    cancelBtn.addEventListener('click', resetAppointmentForm);
    loadDropdowns().then(loadAppointments);
}

// ==========================================
// 4. MEDICAL RECORDS PAGE LOGIC
// ==========================================
function initRecordsPage() {
    const form = document.getElementById('record-form');
    const tableBody = document.getElementById('record-table-body');
    const cancelBtn = document.getElementById('cancel-record-edit');
    const formTitle = document.getElementById('record-form-title');
    const patientSelect = document.getElementById('patient-name');
    const doctorSelect = document.getElementById('doctor-name');

    async function loadDropdowns() {
        try {
            const patients = await apiCall('/patients/');
            const doctors = await apiCall('/doctors/');

            patientSelect.innerHTML = '<option value="">-- Choose Patient --</option>';
            patients.forEach(p => {
                patientSelect.innerHTML += `<option value="${p.patient_name}">${p.patient_name} (ID: ${p.patient_id})</option>`;
            });

            doctorSelect.innerHTML = '<option value="">-- Choose Doctor --</option>';
            doctors.forEach(d => {
                doctorSelect.innerHTML += `<option value="${d.doctor_name}">${d.doctor_name} (${d.specialization})</option>`;
            });
        } catch (e) {
            showToast('Failed to load details for record creation.', 'error');
        }
    }

    async function loadRecords() {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Loading medical records...</td></tr>';
        try {
            const list = await apiCall('/records/');
            tableBody.innerHTML = '';
            if (list.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No medical records found.</td></tr>';
                return;
            }
            list.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${r.record_id}</strong></td>
                    <td>${r.patient_name}</td>
                    <td>${r.doctor_name}</td>
                    <td>${r.diagnosis}</td>
                    <td><code>${r.prescription}</code></td>
                    <td>${r.treatment}</td>
                    <td>${r.visit_date}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm edit-r-btn" data-id="${r.record_id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm delete-r-btn" data-id="${r.record_id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            document.querySelectorAll('.edit-r-btn').forEach(btn => {
                btn.addEventListener('click', () => editRecord(btn.dataset.id, list));
            });
            document.querySelectorAll('.delete-r-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteRecord(btn.dataset.id));
            });
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:var(--accent-rose);">Failed to load medical records.</td></tr>';
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rId = document.getElementById('record-id').value;
        const recordData = {
            patient_name: patientSelect.value,
            doctor_name: doctorSelect.value,
            diagnosis: document.getElementById('record-diagnosis').value,
            prescription: document.getElementById('record-prescription').value,
            treatment: document.getElementById('record-treatment').value,
            visit_date: document.getElementById('record-date').value
        };

        if (!recordData.patient_name || !recordData.doctor_name) {
            showToast('Please select both a patient and a doctor.', 'warning');
            return;
        }

        try {
            if (rId) {
                await apiCall(`/records/update/${rId}/`, 'PUT', recordData);
                showToast('Medical record updated successfully!', 'success');
            } else {
                await apiCall('/records/add/', 'POST', recordData);
                showToast('Medical record added successfully!', 'success');
            }
            resetRecordForm();
            loadRecords();
        } catch (e) {}
    });

    function editRecord(id, list) {
        const r = list.find(item => item.record_id == id);
        if (!r) return;

        document.getElementById('record-id').value = r.record_id;
        patientSelect.value = r.patient_name;
        doctorSelect.value = r.doctor_name;
        document.getElementById('record-diagnosis').value = r.diagnosis;
        document.getElementById('record-prescription').value = r.prescription;
        document.getElementById('record-treatment').value = r.treatment;
        document.getElementById('record-date').value = r.visit_date;

        formTitle.textContent = `Update Medical Record #${id}`;
        cancelBtn.style.display = 'inline-flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function deleteRecord(id) {
        if (confirm(`Are you sure you want to delete medical record #${id}?`)) {
            try {
                await apiCall(`/records/delete/${id}/`, 'DELETE');
                showToast('Record deleted successfully!', 'success');
                loadRecords();
            } catch (e) {}
        }
    }

    function resetRecordForm() {
        form.reset();
        document.getElementById('record-id').value = '';
        formTitle.textContent = 'Add Diagnosis & Treatment';
        cancelBtn.style.display = 'none';
    }

    cancelBtn.addEventListener('click', resetRecordForm);
    loadDropdowns().then(loadRecords);
}

// ==========================================
// 5. BILLING PAGE LOGIC
// ==========================================
function initBillingPage() {
    const form = document.getElementById('bill-form');
    const tableBody = document.getElementById('bill-table-body');
    const cancelBtn = document.getElementById('cancel-bill-edit');
    const formTitle = document.getElementById('bill-form-title');
    const patientSelect = document.getElementById('patient-name');
    const doctorSelect = document.getElementById('doctor-select');
    
    const feeConsult = document.getElementById('consultation-fee');
    const feeMedicine = document.getElementById('medicine-charge');
    const feeLab = document.getElementById('laboratory-charge');
    const totalAmount = document.getElementById('total-amount');

    // Auto-calculate bill sum inside the client view
    function calculateTotal() {
        const c = parseFloat(feeConsult.value) || 0;
        const m = parseFloat(feeMedicine.value) || 0;
        const l = parseFloat(feeLab.value) || 0;
        totalAmount.value = (c + m + l).toFixed(2);
    }
    [feeConsult, feeMedicine, feeLab].forEach(input => {
        input.addEventListener('input', calculateTotal);
    });

    async function loadDropdowns() {
        try {
            const patients = await apiCall('/patients/');
            const doctors = await apiCall('/doctors/');

            patientSelect.innerHTML = '<option value="">-- Choose Patient --</option>';
            patients.forEach(p => {
                patientSelect.innerHTML += `<option value="${p.patient_name}">${p.patient_name} (ID: ${p.patient_id})</option>`;
            });

            // Populate doctors dropdown to auto-retrieve consultation fee
            doctorSelect.innerHTML = '<option value="">-- Choose Doctor (Auto-fills consultation fee) --</option>';
            doctors.forEach(d => {
                doctorSelect.innerHTML += `<option value="${d.consultation_fee}">${d.doctor_name} (${d.specialization} - Fee: ₹${d.consultation_fee})</option>`;
            });
        } catch (e) {
            showToast('Failed to load details for billing creation.', 'error');
        }
    }

    doctorSelect.addEventListener('change', () => {
        if (doctorSelect.value) {
            feeConsult.value = parseFloat(doctorSelect.value).toFixed(2);
            calculateTotal();
        }
    });

    async function loadBills() {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Loading billing information...</td></tr>';
        try {
            const list = await apiCall('/bills/');
            tableBody.innerHTML = '';
            if (list.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No bills generated yet.</td></tr>';
                return;
            }
            list.forEach(b => {
                let badgeClass = 'badge-warning';
                if (b.payment_status === 'Paid') badgeClass = 'badge-success';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${b.bill_id}</strong></td>
                    <td>${b.patient_name}</td>
                    <td>₹${b.consultation_fee.toFixed(2)}</td>
                    <td>₹${b.medicine_charge.toFixed(2)}</td>
                    <td>₹${b.laboratory_charge.toFixed(2)}</td>
                    <td style="font-weight:700; color:var(--text-primary);">₹${b.total_amount.toFixed(2)}</td>
                    <td><span class="badge badge-info">${b.payment_method}</span></td>
                    <td><span class="badge ${badgeClass}">${b.payment_status}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm print-bill-btn" data-id="${b.bill_id}"><i class="fas fa-print"></i></button>
                        <button class="btn btn-secondary btn-sm edit-b-btn" data-id="${b.bill_id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm delete-b-btn" data-id="${b.bill_id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            document.querySelectorAll('.edit-b-btn').forEach(btn => {
                btn.addEventListener('click', () => editBill(btn.dataset.id, list));
            });
            document.querySelectorAll('.delete-b-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteBill(btn.dataset.id));
            });
            document.querySelectorAll('.print-bill-btn').forEach(btn => {
                btn.addEventListener('click', () => printInvoice(btn.dataset.id, list));
            });
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:var(--accent-rose);">Failed to load bills.</td></tr>';
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bId = document.getElementById('bill-id').value;
        const billData = {
            patient_name: patientSelect.value,
            consultation_fee: parseFloat(feeConsult.value) || 0,
            medicine_charge: parseFloat(feeMedicine.value) || 0,
            laboratory_charge: parseFloat(feeLab.value) || 0,
            payment_method: document.getElementById('payment-method').value,
            payment_status: document.getElementById('payment-status').value
        };

        if (!billData.patient_name) {
            showToast('Please select a patient.', 'warning');
            return;
        }

        try {
            if (bId) {
                await apiCall(`/bills/update/${bId}/`, 'PUT', billData);
                showToast('Bill updated successfully!', 'success');
            } else {
                await apiCall('/bills/add/', 'POST', billData);
                showToast('Bill generated successfully!', 'success');
            }
            resetBillForm();
            loadBills();
        } catch (e) {}
    });

    function editBill(id, list) {
        const b = list.find(item => item.bill_id == id);
        if (!b) return;

        document.getElementById('bill-id').value = b.bill_id;
        patientSelect.value = b.patient_name;
        doctorSelect.value = ''; // Reset helper selector
        feeConsult.value = b.consultation_fee.toFixed(2);
        feeMedicine.value = b.medicine_charge.toFixed(2);
        feeLab.value = b.laboratory_charge.toFixed(2);
        document.getElementById('payment-method').value = b.payment_method;
        document.getElementById('payment-status').value = b.payment_status;
        calculateTotal();

        formTitle.textContent = `Update Bill #${id}`;
        cancelBtn.style.display = 'inline-flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function deleteBill(id) {
        if (confirm(`Are you sure you want to delete invoice record #${id}?`)) {
            try {
                await apiCall(`/bills/delete/${id}/`, 'DELETE');
                showToast('Bill deleted successfully!', 'success');
                loadBills();
            } catch (e) {}
        }
    }

    function printInvoice(id, list) {
        const b = list.find(item => item.bill_id == id);
        if (!b) return;

        // Populate print details
        document.getElementById('print-invoice-id').textContent = b.bill_id;
        document.getElementById('print-patient-name').textContent = b.patient_name;
        document.getElementById('print-payment-method').textContent = b.payment_method;
        document.getElementById('print-payment-status').textContent = b.payment_status;
        document.getElementById('print-date').textContent = new Date().toLocaleDateString();

        document.getElementById('print-consult-fee').textContent = `₹${b.consultation_fee.toFixed(2)}`;
        document.getElementById('print-medicine-fee').textContent = `₹${b.medicine_charge.toFixed(2)}`;
        document.getElementById('print-lab-fee').textContent = `₹${b.laboratory_charge.toFixed(2)}`;
        document.getElementById('print-total').textContent = `₹${b.total_amount.toFixed(2)}`;

        // Trigger print operation
        window.print();
    }

    function resetBillForm() {
        form.reset();
        document.getElementById('bill-id').value = '';
        totalAmount.value = '0.00';
        formTitle.textContent = 'Generate New Bill';
        cancelBtn.style.display = 'none';
    }

    cancelBtn.addEventListener('click', resetBillForm);
    loadDropdowns().then(loadBills);
}

// ==========================================
// 6. DASHBOARD PAGE LOGIC
// ==========================================
async function initDashboardPage() {
    try {
        const patients = await apiCall('/patients/');
        const doctors = await apiCall('/doctors/');
        const appointments = await apiCall('/appointments/');
        const records = await apiCall('/records/');
        const bills = await apiCall('/bills/');

        // 1. Stats Numbers
        document.getElementById('total-patients').textContent = patients.length;
        document.getElementById('total-doctors').textContent = doctors.length;
        document.getElementById('total-records').textContent = records.length;

        // Today's appointments count
        const todayStr = new Date().toISOString().split('T')[0];
        const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);
        document.getElementById('today-appointments-count').textContent = todayAppointments.length;

        // Billing Summary: Sum up paid invoices
        const revenue = bills
            .filter(b => b.payment_status === 'Paid')
            .reduce((sum, b) => sum + b.total_amount, 0);
        document.getElementById('total-revenue').textContent = `₹${revenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

        // 2. Render Today's Appointments table list
        const todayTable = document.getElementById('today-appointments-table');
        todayTable.innerHTML = '';
        if (todayAppointments.length === 0) {
            todayTable.innerHTML = '<tr><td colspan="5" style="text-align:center;">No appointments scheduled for today.</td></tr>';
        } else {
            todayAppointments.forEach(a => {
                let badgeClass = 'badge-warning';
                if (a.appointment_status === 'Completed') badgeClass = 'badge-success';
                if (a.appointment_status === 'Cancelled') badgeClass = 'badge-danger';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${a.appointment_id}</strong></td>
                    <td>${a.patient_name}</td>
                    <td>${a.doctor_name}</td>
                    <td>${a.appointment_time}</td>
                    <td><span class="badge ${badgeClass}">${a.appointment_status}</span></td>
                `;
                todayTable.appendChild(tr);
            });
        }

        // 3. Render recent general appointments limit to 5
        const recentTable = document.getElementById('recent-appointments-table');
        recentTable.innerHTML = '';
        const recentList = appointments.slice(-5).reverse(); // last 5 items
        if (recentList.length === 0) {
            recentTable.innerHTML = '<tr><td colspan="5" style="text-align:center;">No recent appointments.</td></tr>';
        } else {
            recentList.forEach(a => {
                let badgeClass = 'badge-warning';
                if (a.appointment_status === 'Completed') badgeClass = 'badge-success';
                if (a.appointment_status === 'Cancelled') badgeClass = 'badge-danger';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${a.appointment_id}</strong></td>
                    <td>${a.patient_name}</td>
                    <td>${a.doctor_name}</td>
                    <td>${a.appointment_date}</td>
                    <td><span class="badge ${badgeClass}">${a.appointment_status}</span></td>
                `;
                recentTable.appendChild(tr);
            });
        }
    } catch (e) {
        showToast('Failed to retrieve dashboard summaries.', 'error');
    }
}
