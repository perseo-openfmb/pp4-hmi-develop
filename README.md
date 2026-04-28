# pp4-hmi-develop
OpenFMB HMI development by the PERSEO P4 project

### build the image
>>> docker build -t openfmb-hmi .

### run the container
>>> docker run -d -p 32771:32771 -e APP_CONF=/cfg/app.toml -e APP_DIR_NAME=/cfg -v ${PWD}/config:/cfg openfmb-hmi

### run with docker compose (HMI + Grafana + reverse proxy)
>>> docker compose up -d

El frontend HMI queda disponible en `http://<IP_DEL_HOST>:32771/` y Grafana en `http://<IP_DEL_HOST>:3000/`.
Grafana se levanta con rol anónimo `Admin` en este entorno para permitir configuración de conexiones y consultas.
