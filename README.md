# uso de docker

## 1. Bajar y crear la imgen de postgres

```bash
docker run --name postgres17 \
 -e POSTGRES_PASSWORD=postgres \
 -e POSTGRES_USER=postgres \
 -p 5438:5432 \
 -v pgdata:/var/lib/postgresql/data \
 -v /run/media/angelo/WinterOS/Users/Angelo/Downloads:/backups \
 -d postgres:17.5
```

## 2. Ejecutar el back

```bash
docker exec -it postgres17 psql -U postgres -c "CREATE ROLE bdsianet WITH LOGIN;"
docker exec -it postgres17 psql -U postgres -c "CREATE DATABASE sianet3;"
docker exec -it postgres17 psql -U postgres -d sianet3 -f /backups/sianet3_24-06-25-00H07.sql
```
