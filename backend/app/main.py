from fastapi import FastAPI

app = FastAPI(
    title="Salary Management API",
    description="Employee salary management system",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {"status": "healthy"}