# uso de docker

## 1. Bajar y crear la imgen de postgres

```bash
docker run --name your_db_main \
 -e POSTGRES_USER=your_user_main \
 -e POSTGRES_PASSWORD=your_pass_main \
 -p your_port:5432 \
 -v pgdata:/var/lib/postgresql/data \
 -v /ruta:back:/backups \
 -d postgres:17.5
```

## 2. Ejecutar el back

```bash
docker exec -it your_db_main psql -U your_user_main -c "CREATE ROLE bdsianet WITH LOGIN;"
docker exec -it your_db_main psql -U your_user_main -c "CREATE DATABASE sianet3;"
docker exec -it your_db_main psql -U your_user_main -d sianet3 -f /backups/sianet3_24-06-25-00H07.sql
```

## 3. Crear segunda base datos

```bash
docker run --name your_bd \
 -e POSTGRES_PASSWORD=your_pss \
 -e POSTGRES_USER=your_user \
 -p your_port:5432 \
 -v pgdata:/var/lib/postgresql/data \
 -d postgres:17.5
```
