from datetime import date


def employee_payload():
    return {
        "employee_code": "EMP001",
        "first_name": "Rahul",
        "last_name": "Sharma",
        "email": "rahul@example.com",
        "country_id": 1,
        "department_id": 1,
        "designation": "Software Engineer",
        "employment_status": "active",
        "joining_date": str(date(2026, 1, 1)),
    }

def test_create_employee(client, seed_reference_data):
    payload = {
        "employee_code": "EMP001",
        "first_name": "Rahul",
        "last_name": "Sharma",
        "email": "rahul@example.com",
        "country_id": seed_reference_data["country_id"],
        "department_id": seed_reference_data["department_id"],
        "designation": "Software Engineer",
        "employment_status": "active",
        "joining_date": "2026-01-01",
    }

    response = client.post(
        "/api/v1/employees/",
        json=payload,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["employee_code"] == "EMP001"
    assert data["email"] == "rahul@example.com"
    
def test_duplicate_employee_code(
    client,
    seed_reference_data,
):
    payload = {
        "employee_code": "EMP002",
        "first_name": "Rahul",
        "last_name": "Sharma",
        "email": "rahul2@example.com",
        "country_id": seed_reference_data["country_id"],
        "department_id": seed_reference_data["department_id"],
        "designation": "Developer",
        "employment_status": "active",
        "joining_date": "2026-01-01",
    }

    first = client.post(
        "/api/v1/employees/",
        json=payload,
    )

    assert first.status_code == 201

    payload["email"] = "different@example.com"

    second = client.post(
        "/api/v1/employees/",
        json=payload,
    )

    assert second.status_code == 400
    assert "already exists" in second.json()["detail"]        
    
def test_get_employee(client, seed_reference_data):
    payload = {
        "employee_code": "EMP003",
        "first_name": "Amit",
        "last_name": "Patel",
        "email": "amit@example.com",
        "country_id": seed_reference_data["country_id"],
        "department_id": seed_reference_data["department_id"],
        "designation": "Backend Developer",
        "employment_status": "active",
        "joining_date": "2026-01-01",
    }

    create_response = client.post(
        "/api/v1/employees/",
        json=payload,
    )

    assert create_response.status_code == 201

    employee_id = create_response.json()["id"]

    response = client.get(
        f"/api/v1/employees/{employee_id}"
    )

    assert response.status_code == 200
    assert response.json()["id"] == employee_id
    assert response.json()["first_name"] == "Amit"
    
def test_get_employee_not_found(client):
    response = client.get("/api/v1/employees/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Employee not found"
    
def test_update_employee(client, seed_reference_data):
    payload = {
        "employee_code": "EMP004",
        "first_name": "Neha",
        "last_name": "Shah",
        "email": "neha@example.com",
        "country_id": seed_reference_data["country_id"],
        "department_id": seed_reference_data["department_id"],
        "designation": "Developer",
        "employment_status": "active",
        "joining_date": "2026-01-01",
    }

    create_response = client.post(
        "/api/v1/employees/",
        json=payload,
    )

    assert create_response.status_code == 201

    employee_id = create_response.json()["id"]

    response = client.patch(
        f"/api/v1/employees/{employee_id}",
        json={
            "designation": "Senior Developer"
        },
    )

    assert response.status_code == 200
    assert response.json()["designation"] == "Senior Developer"

def test_delete_employee(client, seed_reference_data):
    payload = {
        "employee_code": "EMP005",
        "first_name": "Raj",
        "last_name": "Mehta",
        "email": "raj@example.com",
        "country_id": seed_reference_data["country_id"],
        "department_id": seed_reference_data["department_id"],
        "designation": "Developer",
        "employment_status": "active",
        "joining_date": "2026-01-01",
    }

    create_response = client.post(
        "/api/v1/employees/",
        json=payload,
    )

    employee_id = create_response.json()["id"]

    response = client.delete(
        f"/api/v1/employees/{employee_id}"
    )

    assert response.status_code == 204

    get_response = client.get(
        f"/api/v1/employees/{employee_id}"
    )

    assert get_response.status_code == 404      
            