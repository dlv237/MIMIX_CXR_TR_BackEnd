FROM node:18-alpine

# Instalar Python y herramientas necesarias
RUN apk add --no-cache python3 py3-pip py3-virtualenv

# Crear y configurar el directorio de trabajo
WORKDIR /app

# Copiar los archivos de Node.js
COPY package*.json ./
RUN yarn install

# Crear un entorno virtual y activarlo
RUN python3 -m venv /app/venv

# Copiar el archivo requirements.txt
COPY requirements.txt .

# Instalar las dependencias de Python dentro del entorno virtual
RUN . /app/venv/bin/activate && pip install --no-cache-dir -r requirements.txt

# Copiar todo el proyecto
COPY . .

# Comando para ejecutar la aplicación y los scripts
CMD ["sh", "-c", "sleep 5 && yarn sequelize db:migrate && yarn sequelize-cli db:seed:all && . /app/venv/bin/activate && yarn dev"]

# Exponer el puerto de la aplicación
EXPOSE 3000
