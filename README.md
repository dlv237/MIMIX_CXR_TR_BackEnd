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

### Deploy del Backend


## Backup SQL

```
sudo docker run --rm   -e PGPASSWORD=1qazxsw2M   -v $(pwd):/backup   postgres:15   pg_dump -h localhost -p 5445 -U dolobos MIMIC_CXR_DB -f /backup/backup.sql
```
