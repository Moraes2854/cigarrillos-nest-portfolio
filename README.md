<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>


1. Clonar proyecto
2. ```npm install```
3. Renombrar el archivo ```.env.development``` a ```.env```
4. Levantar la base de datos
```
docker-compose up -d
```

6. Levantar servidor: ```npm run start:dev```
7. Utilizar en ```http://localhost:${PORT}```
8. Utilizar seed ejecutando una peticion get al endpoint ```http://localhost:${PORT}/api/seed```

Informacion extra en: ```https://docs.google.com/document/d/1CMk2IeSYlRiy5wgzvFzl2iCB1NBepQn7fhI6X1yJif0/edit```