# Fondecyt HAIVis

## Como levantar Backend

Para ejecutar el proyecto deben tener instalado docker "https://docs.docker.com/manuals/"

1. docker compose build
2. docker compose up
3. docker compose down


### Configuración de las variables d entorno (.env)

DB_USER y DB_PASSWORD son su usuario y contraseña de postgres. PORT es el puerto al que se quiere que el backend escuche (por defecto es el 3000).

```
DB_USERNAME = 
DB_PASSWORD = 
DB_NAME = nombre_bdd
PORT =
```

## Documentación 
## Deploy del Backend

para subir a docker hub, desde la rama de cloud run:

```
docker build -t dlv237/api-mimic-cxr:latest --no-cache . && docker push dlv237/api-mimic-cxr:latest
```