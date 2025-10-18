const db = require('./db');

const setupDatabase = async () => {
  try {
    console.log('Setting up database tables...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS salespersons (
        salesperson_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cars (
        car_id SERIAL PRIMARY KEY,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        vin VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'Available'
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS sales (
        sale_id SERIAL PRIMARY KEY,
        car_id INT REFERENCES cars(car_id),
        customer_id INT REFERENCES customers(customer_id),
        salesperson_id INT REFERENCES salespersons(salesperson_id),
        sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        sale_price DECIMAL(10, 2) NOT NULL
      );
    `);

    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

module.exports = setupDatabase;
