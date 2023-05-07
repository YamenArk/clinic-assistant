import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { CorsOptions } from 'cors';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();


const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
});

connection.query(
  `CREATE DATABASE IF NOT EXISTS clinicassistant`,
  function (err, results) {
  }
);

connection.end();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  app.use(cors(corsOptions));


  app.use(express.static(join(__dirname, '..', 'public')));
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "clinicassistant",
  });
  
  connection.query(
    `INSERT INTO admins (isAdmin, email, password, createdAt)
    SELECT * FROM (SELECT TRUE, 'admin@gmail.com', '$2a$10$hHmY6rPXtzFRoBsWoseoae8XpcJF4rn/j.Sdw4P8/aJCKi./j2iGW', NOW()) AS tmp
    WHERE NOT EXISTS (
        SELECT * FROM admins WHERE isAdmin = TRUE AND email = 'admin@gmail.com'
    ) LIMIT 1;`,
    function (err, results) {
      if (err) {
        console.log('Error creating admin:', err);
      } else {
      }
      connection.end();
    }
  );

  await app.listen(3000);
}

bootstrap();