FROM alpine:latest

# Instalar OpenSSH Client y sshpass
RUN apk add --no-cache openssh-client sshpass

# Copiar el script para establecer el túnel SSH
COPY start-tunnel.sh /start-tunnel.sh

# Verificar si el archivo está copiado correctamente
RUN ls -l /start-tunnel.sh

# Asegurarse de que el archivo sea ejecutable
RUN chmod +x /start-tunnel.sh

# Comando para ejecutar el túnel SSH
CMD sshpass -p 'pass' ssh -o StrictHostKeyChecking=no -v -N -L 5445:localhost:5432 dolobos@calfuco.ing.puc.cl
