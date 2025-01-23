#!/bin/bash

# Establecer el túnel SSH en segundo plano con la contraseña
sshpass -p 'pass' ssh -o StrictHostKeyChecking=no -N -L 5445:localhost:5432 dolobos@calfuco.ing.puc.cl -f

# Mantener el contenedor en ejecución
tail -f /dev/null
