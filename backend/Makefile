# Compila todos los microservicios sin ejecutar tests
build:
	mvn clean install -DskipTests

# Levanta todos los contenedores (y los construye si es necesario)
docker-up:
	docker compose up --build

# Detiene los contenedores
docker-down:
	docker compose down

# Limpia imágenes y contenedores no usados
clean:
	docker system prune -f