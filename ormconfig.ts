import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './src/users/entities/user.entity';
import { Payment } from './src/payments/entities/payment.entity';

dotenv.config();

const dataSourceOptions: DataSourceOptions & { seeds: string[] } = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT as string, 10) || 5433,
  username: process.env.POSTGRES_USER || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'payment_db',
  entities: [User, Payment],
  migrations: [__dirname + '/src/migrations/**/*.ts'],
  seeds: [__dirname + '/src/seeds/**/*.ts'],
  synchronize: false, // Migrations handle schema synchronization
};

export const AppDataSource = new DataSource(dataSourceOptions);
