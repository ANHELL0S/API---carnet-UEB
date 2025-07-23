# uso de docker

## 1. Bajar y crear la imgen de postgres

```bash
docker run --name your_name_container \
 -e POSTGRES_DB=your_name_db \
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
docker run --name your_name_container \
 -e POSTGRES_DB=your_name_db \
 -e POSTGRES_PASSWORD=your_pss \
 -e POSTGRES_USER=your_user \
 -p your_port:5432 \
 -v pgdata:/var/lib/postgresql/data \
 -d postgres:17.5
```

docker run --name carnet_db \
-e POSTGRES_DB=carnet_db \
 -e POSTGRES_PASSWORD=carnet_pass \
 -e POSTGRES_USER=carnet_user \
 -p 5439:5432 \
 -v carnet_pgdata:/var/lib/postgresql/data \
--restart unless-stopped \
-d postgres:17.5

# DOCKER COMPOSE

Dentro de server ejecuta:
Esto crea la iamgen de docker

```bash
NODE_ENV=development docker-compose up --build
```

Luego para leventar otra vez la imagen:
nota: solo si ya creaste la imagen previamente

```bash
NODE_ENV=development docker-compose up
```

Nota: si ya esta en produccion
Solo levanta la imgen de docker creada con

```bash
docker start server-api-1
```
