from locust import HttpUser, task, between
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL")
ADMIN_TEST_EMAIL = os.getenv("ADMIN_TEST_EMAIL")
ADMIN_TEST_PASSWORD = os.getenv("ADMIN_TEST_PASSWORD")

class UserBehavior(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        """Se ejecuta cuando el usuario comienza (al iniciar la prueba)"""
        self.token = self.login()

    def login(self):
        """Realiza el login y devuelve el token de acceso."""
        response = self.client.post("/login", json={"email": ADMIN_TEST_EMAIL, "password": ADMIN_TEST_PASSWORD})
        response.raise_for_status()  # Lanza un error si el login falla
        return response.json().get("access_token")

    def perform_request(self, route, request_type="GET", payload=None):
        """Realiza una solicitud a una ruta específica, sin contar los 404 como error"""
        headers = {"Authorization": f"Bearer {self.token}"}

        if request_type == "GET":
            response = self.client.get(route, headers=headers)
        elif request_type == "POST":
            response = self.client.post(route, json=payload, headers=headers)
        else:
            raise ValueError("Unsupported request type")

        # Si el código de estado es 404, lo ignoramos como error
        if response.status_code == 404:
            print(f"NOT FOUND: {route}")
            return response  # Simplemente retornamos la respuesta sin incrementos

        # Si el código es mayor o igual a 400 (y no es 404), lo tratamos como un error
        if response.status_code >= 400:
            print(f"ERROR {response.status_code}: {route}")
            self.environment.events.request_failure.fire(
                request_type=request_type,
                name=route,
                response_time=response.elapsed.total_seconds() * 1000,  # tiempo de respuesta en ms
                exception=None,  # si es un código de error, no necesitas pasar una excepción
                response=response
            )
        return response

    @task
    def load_test_route(self):
        """Realiza un test de carga en una ruta"""
        self.perform_request("/userreportgroups/report/1/7", request_type="GET")

    @task
    def multiple_routes(self):
        """Realiza un test en varias rutas"""
        routes = [
            "/reportgroupreports/1",
            "/userreportgroups/user/1",
            *[f"/usertranslatedsentences/{i}" for i in range(1, 30)],
        ]
        for route in routes:
            self.perform_request(route, request_type="GET")
