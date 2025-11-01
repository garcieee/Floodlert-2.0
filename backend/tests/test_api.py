"""
Tests for the flood prediction API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Test that the API is accessible."""
    response = client.get("/health")
    assert response.status_code == 200


def test_predict_endpoint():
    """Test the flood prediction endpoint."""
    # TODO: Add actual test cases when API is fully implemented
    pass

