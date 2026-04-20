# pp4-hmi-develop
OpenFMB HMI development by the PERSEO P4 project

### build the image
>>> docker build -t openfmb-hmi .

### run the container
>>> docker run -d -p 32771:32771 -e APP_CONF=/cfg/app.toml -e APP_DIR_NAME=/cfg -v ${PWD}/config:/cfg openfmb-hmi