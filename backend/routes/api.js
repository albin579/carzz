const express = require('express');
const db = require('../db');
const router = express.Router();

// --- Cars API ---

// Get all cars
router.get('/cars', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM cars ORDER BY car_id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a new car
router.post('/cars', async (req, res) => {
  const { make, model, year, price, vin } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO cars (make, model, year, price, vin) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [make, model, year, price, vin]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a car
router.put('/cars/:id', async (req, res) => {
  const { id } = req.params;
  const { make, model, year, price, vin, status } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE cars SET make = $1, model = $2, year = $3, price = $4, vin = $5, status = $6 WHERE car_id = $7 RETURNING *',
      [make, model, year, price, vin, status, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a car
router.delete('/cars/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM cars WHERE car_id = $1', [id]);
    res.json({ msg: 'Car removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Customers API ---

// Get all customers
router.get('/customers', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM customers ORDER BY customer_id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a new customer
router.post('/customers', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, email, phone]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a customer
router.put('/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE customers SET name = $1, email = $2, phone = $3 WHERE customer_id = $4 RETURNING *',
      [name, email, phone, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a customer
router.delete('/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM customers WHERE customer_id = $1', [id]);
    res.json({ msg: 'Customer removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Salespersons API ---

// Get all salespersons
router.get('/salespersons', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM salespersons ORDER BY salesperson_id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a new salesperson
router.post('/salespersons', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO salespersons (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, email, phone]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a salesperson
router.put('/salespersons/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE salespersons SET name = $1, email = $2, phone = $3 WHERE salesperson_id = $4 RETURNING *',
      [name, email, phone, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a salesperson
router.delete('/salespersons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Before deleting a salesperson, you might want to re-assign their sales or handle it as per your business logic.
    // For simplicity, we'll just delete them here.
    // Note: If a salesperson is linked to a sale, this will fail if foreign key constraints are set to restrict deletion.
    // You would need to either set sales to NULL or re-assign them first.
    await db.query('DELETE FROM salespersons WHERE salesperson_id = $1', [id]);
    res.json({ msg: 'Salesperson removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Sales API ---

// Get all sales
router.get('/sales', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        s.sale_id, 
        c.make, c.model, 
        cu.name as customer_name, 
        sp.name as salesperson_name, 
        s.sale_date, 
        s.sale_price
      FROM sales s
      JOIN cars c ON s.car_id = c.car_id
      JOIN customers cu ON s.customer_id = cu.customer_id
      JOIN salespersons sp ON s.salesperson_id = sp.salesperson_id
      ORDER BY s.sale_id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a new sale
router.post('/sales', async (req, res) => {
  const { car_id, customer_id, salesperson_id, sale_price } = req.body;
  try {
    // Start a transaction
    await db.query('BEGIN');

    const { rows } = await db.query(
      'INSERT INTO sales (car_id, customer_id, salesperson_id, sale_price) VALUES ($1, $2, $3, $4) RETURNING *',
      [car_id, customer_id, salesperson_id, sale_price]
    );

    // Mark the car as 'Sold'
    await db.query('UPDATE cars SET status = $1 WHERE car_id = $2', ['Sold', car_id]);

    
    await db.query('COMMIT');

    res.status(201).json(rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.patch('/sales/:id', async (req, res) => {
  const { id } = req.params;
  const { sale_price } = req.body;

  if (!sale_price) {
    return res.status(400).json({ msg: 'Sale price is required' });
  }

  try {
    const { rows } = await db.query(
      'UPDATE sales SET sale_price = $1 WHERE sale_id = $2 RETURNING *',
      [sale_price, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Sale not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.delete('/sales/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM sales WHERE sale_id = $1', [id]);
    res.json({ msg: 'Sale removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT first_name, last_name, email, phone FROM users WHERE user_id = $1', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/profile', async (req, res) => {
  const { first_name, last_name, email, phone } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE users SET first_name = $1, last_name = $2, email = $3, phone = $4 WHERE user_id = $5 RETURNING *',
      [first_name, last_name, email, phone, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



router.get('/dashboard-stats', async (req, res) => {
  try {
    const cars = await db.query('SELECT COUNT(*) FROM cars');
    const sales = await db.query('SELECT SUM(sale_price) FROM sales');
    const staff = await db.query('SELECT COUNT(*) FROM salespersons');
    const customers = await db.query('SELECT COUNT(*) FROM customers');

    res.json({
      total_cars: parseInt(cars.rows[0].count, 10),
      total_sales: parseFloat(sales.rows[0].sum, 10),
      active_staff: parseInt(staff.rows[0].count, 10),
      total_customers: parseInt(customers.rows[0].count, 10),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
