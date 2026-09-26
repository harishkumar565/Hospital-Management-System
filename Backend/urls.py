from django.urls import path, re_path
from django.views.static import serve
from django.conf import settings
from . import views

urlpatterns = [
    # Patients API
    path('patients/add/', views.add_patient),
    path('patients/', views.get_patients),
    path('patients/update/<int:id>/', views.update_patient),
    path('patients/delete/<int:id>/', views.delete_patient),

    # Doctors API
    path('doctors/add/', views.add_doctor),
    path('doctors/', views.get_doctors),
    path('doctors/update/<int:id>/', views.update_doctor),
    path('doctors/delete/<int:id>/', views.delete_doctor),

    # Appointments API
    path('appointments/add/', views.add_appointment),
    path('appointments/', views.get_appointments),
    path('appointments/update/<int:id>/', views.update_appointment),
    path('appointments/delete/<int:id>/', views.delete_appointment),

    # Medical Records API
    path('records/add/', views.add_record),
    path('records/', views.get_records),
    path('records/update/<int:id>/', views.update_record),
    path('records/delete/<int:id>/', views.delete_record),

    # Billing API
    path('bills/add/', views.add_bill),
    path('bills/', views.get_bills),
    path('bills/update/<int:id>/', views.update_bill),
    path('bills/delete/<int:id>/', views.delete_bill),

    # Root redirect
    path('', views.root_redirect),
    
    # Serve Frontend static files
    re_path(r'^(?P<path>.*)$', serve, {'document_root': settings.FRONTEND_DIR}),
]
