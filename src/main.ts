import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { CorsOptions } from 'cors';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import { QueryService } from './middleware/sql/query/query.service';
// import { CronService } from './cron.service';
dotenv.config();

const mysql = require("mysql2/promise"); // use the promise-based version of mysql2

async function bootstrap() {
  // Create the database connection
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    // database: "clinicassistant",
  });

  // Create the database if it doesn't exist
  try {
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS clinicassistant CHARACTER SET utf8 COLLATE utf8_general_ci`
    );

  } catch (err) {
    console.log('Error creating database:', err);
  }

  // Create the NestJS app
  const app = await NestFactory.create(AppModule);

  // const cronService = app.get(CronService);
  // Configure the CORS options
  const corsOptions: CorsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.use(cors(corsOptions));
  // Serve static files from the root directory

  // If you're using Socket.IO, configure its CORS settings as well
  const httpServer = app.getHttpServer();
  const io = require('socket.io')(httpServer, {
    cors: {
      origin: corsOptions.origin,
      methods: corsOptions.methods,
      allowedHeaders: corsOptions.allowedHeaders,
    },
  });
  



  app.use(express.static(join(__dirname, '..')));
  
  

  // Start the server
  const server = await app.listen(3000, async () => {
    const queryService = app.get(QueryService); // get an instance of the QueryService
    await queryService.addingAdminGovernorateArea(); // call the addingAdminGovernorateArea method
    console.log('Server started on port 3000');
    
  });

  // Close the database connection when the server is shut down
  server.on('close', () => {
    connection.end();
  });
}

bootstrap();