import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect
from . import db

def cors_response(data, status=200):
    response = JsonResponse(data, status=status, safe=False)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

def api_view(allowed_methods):
    def decorator(view_func):
        @csrf_exempt
        def wrapped_view(request, *args, **kwargs):
            if request.method == 'OPTIONS':
                return cors_response({}, status=204)
            if request.method not in allowed_methods:
                return cors_response({'error': f'Method {request.method} not allowed'}, status=405)
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator

def root_redirect(request):
    return redirect('/index.html')

# --- PATIENTS ENDPOINTS ---
@api_view(['POST'])
def add_patient(request):
    try:
        data = json.loads(request.body)
        res = db.add_patient(data)
        return cors_response(res, status=201)
    except Exception as e:
        return cors_response({'error': str(e)}, status=400)

@api_view(['GET'])
def get_patients(request):
    try:
        res = db.get_patients()
        return cors_response(res)
    except Exception as e:
        return cors_response({'error': str(e)}, status=500)

@api_view(['PUT'])
def update_patient(request, id):
    try:
        data = json.loads(request.body)
        res = db.update_patient(id, data)
        if res:
            return cors_response(res)
        return cors_response({'error': 'Patient not found'}, status=404)
    except Exception as e:
        return cors_response({'error': str(e)}, status=400)

@api_view(['DELETE'])
def delete_patient(request, id):
    try:
        db.delete_patient(id)
        return cors_response({'message': 'Patient deleted successfully'})
    except Exception as e:
        return cors_response({'error': str(e)}, status=500)

# --- DOCTORS ENDPOINTS ---
@api_view(['POST'])
def add_doctor(request):
    try:
        data = json.loads(request.body)
        res = db.add_doctor(data)
        return cors_response(res, status=201)
    except Exception as e:
        return cors_response({'error': str(e)}, status=400)

@api_view(['GET'])
def get_doctors(request):
    try:
        res = db.get_doctors()
        return cors_response(res)
    except Exception as e:
        return cors_response({'error': str(e)}, status=500)

@api_view(['PUT'])
def update_doctor(request, id):
    try:
        data = json.loads(request.body)
        res = db.update_doctor(id, data)
        if res:
            return cors_response(res)
        return cors_response({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        return cors_response({'error': str(e)}, status=400)

@api_view(['DELETE'])
def delete_doctor(request, id):
    try:
        db.delete_doctor(id)
        return cors_response({'message': 'Doctor deleted successfully'})
    except Exception as e:
        return cors_response({'error': str(e)}, status=500)

# --- APPOINTMENTS ENDPOINTS ---
@api_view(['POST'])
def add_appointment(request):
    try:
        data = json.loads(request.body)
        res = db.add_appointment(data)
        return cors_response(res, status=201)
    except Exception as e:
        return cors_response({'error': str(e)}, status=400)

@api_view(['GET'])
def get_appointments(request):
    try:
        res = db.get_appointments()
        return cors_response(res)
    except Exception as e:
        return cors_response({'error': str(e)}, status=500)

@api_view(['PUT'])
def update_appointment(request, id):
    try:
        data = json.loads(request.body)
        res = db.update_appointment(id, data)
        if res:
            return cors_response(res)
        return cors_response({'error': 'Appointment not found'}, status=404)
    except Exception as e:
        return cors_response({'error': str(e)}, status=400)

@api_view(['DELETE'])
def delete_appointment(request, id):
    try:
        db.delete_appointment(id)
        return cors_response({'message': 'Appointment deleted successfully'})
    except Exception as e:
        return cors_response({'error': str(e)}, status=500)

# --- MEDICAL RECORDS ENDPOINTS ---
@api_view(['POST'])
def add_record(request):
    try:
        data = json.loads(request.body)
        res = db.add_record(data)
        return cors_response(res, status=201)
    except Exception as e:
        return cors_response({'error': str(e)}, status=400)

@api_view(['GET'])
def get_records(request):
    try:
        res = db.get_records()
        return cors_response(res)
    except Exception as e:
        return cors_response({'error': str(e)}, status=500)

@api_view(['PUT'])
def update_record(request, id):
    try:
        data = json.loads(request.body)
        res = db.update_record(id, data)
        if res:
            return cors_response(res)
        return cors_response({'error': 'Record not found'}, status=404)
    except Exception as e:
        return cors_response({'error': str(e)}, status=400)

@api_view(['DELETE'])
def delete_record(request, id):
    try:
        db.delete_record(id)
        return cors_response({'message': 'Record deleted successfully'})
    except Exception as e:
        return cors_response({'error': str(e)}, status=500)

# --- BILLS ENDPOINTS ---
@api_view(['POST'])
def add_bill(request):
    try:
        data = json.loads(request.body)
        res = db.add_bill(data)
        return cors_response(res, status=201)
    except Exception as e:
        return cors_response({'error': str(e)}, status=400)

@api_view(['GET'])
def get_bills(request):
    try:
        res = db.get_bills()
        return cors_response(res)
    except Exception as e:
        return cors_response({'error': str(e)}, status=500)

@api_view(['PUT'])
def update_bill(request, id):
    try:
        data = json.loads(request.body)
        res = db.update_bill(id, data)
        if res:
            return cors_response(res)
        return cors_response({'error': 'Bill not found'}, status=404)
    except Exception as e:
        return cors_response({'error': str(e)}, status=400)

@api_view(['DELETE'])
def delete_bill(request, id):
    try:
        db.delete_bill(id)
        return cors_response({'message': 'Bill deleted successfully'})
    except Exception as e:
        return cors_response({'error': str(e)}, status=500)
