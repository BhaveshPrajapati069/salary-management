from decimal import Decimal


def create_employee(client, reference_data):
    payload = {
        "employee_code": "EMP100",
        "first_name": "Amit",
        "last_name": "Patel",
        "email": "amit@example.com",
        "country_id": reference_data["country_id"],
        "department_id": reference_data["department_id"],
        "designation": "Software Engineer",
        "employment_status": "active",
        "joining_date": "2026-01-01",
    }

    response = client.post(
        "/api/v1/employees/",
        json=payload,
    )

    assert response.status_code == 201

    return response.json()["id"]

def test_create_initial_salary(client, seed_reference_data):
    employee_id = create_employee(
        client,
        seed_reference_data,
    )

    response = client.post(
        f"/api/v1/employees/{employee_id}/salary",
        json={
            "base_salary": 50000,
            "currency": "INR",
            "effective_from": "2026-01-01",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert Decimal(data["base_salary"]) == Decimal("50000")
    assert data["currency"] == "INR"
    assert data["employee_id"] == employee_id
    
def test_update_salary_creates_history(
    client,
    seed_reference_data,
):
    employee_id = create_employee(
        client,
        seed_reference_data,
    )

    create_response = client.post(
        f"/api/v1/employees/{employee_id}/salary",
        json={
            "base_salary": 50000,
            "currency": "INR",
            "effective_from": "2026-01-01",
        },
    )

    assert create_response.status_code == 201

    update_response = client.patch(
        f"/api/v1/employees/{employee_id}/salary",
        json={
            "new_salary": 60000,
            "effective_date": "2027-01-01",
            "reason": "Annual salary revision",
        },
    )

    assert update_response.status_code == 200

    salary = update_response.json()

    assert Decimal(salary["base_salary"]) == Decimal("60000")

    history_response = client.get(
        f"/api/v1/employees/{employee_id}/salary/history"
    )

    assert history_response.status_code == 200

    history = history_response.json()

    assert len(history) == 1
    assert Decimal(history[0]["old_salary"]) == Decimal("50000")
    assert Decimal(history[0]["new_salary"]) == Decimal("60000")
    assert Decimal(history[0]["change_percentage"]) == Decimal("20.00")
    assert history[0]["reason"] == "Annual salary revision"

def test_cannot_create_second_active_salary(
    client,
    seed_reference_data,
):
    employee_id = create_employee(
        client,
        seed_reference_data,
    )

    first = client.post(
        f"/api/v1/employees/{employee_id}/salary",
        json={
            "base_salary": 50000,
            "currency": "INR",
            "effective_from": "2026-01-01",
        },
    )

    assert first.status_code == 201

    second = client.post(
        f"/api/v1/employees/{employee_id}/salary",
        json={
            "base_salary": 60000,
            "currency": "INR",
            "effective_from": "2027-01-01",
        },
    )

    assert second.status_code == 400
    assert "active salary" in second.json()["detail"]

def test_salary_must_be_positive(
    client,
    seed_reference_data,
):
    employee_id = create_employee(
        client,
        seed_reference_data,
    )

    response = client.post(
        f"/api/v1/employees/{employee_id}/salary",
        json={
            "base_salary": 0,
            "currency": "INR",
            "effective_from": "2026-01-01",
        },
    )

    assert response.status_code in (400, 422)            