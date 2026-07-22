const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://manufacturing-erp-1f04f.web.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255),
        brand_name VARCHAR(255),
        product_name VARCHAR(255),
        quantity INTEGER,
        delivery_location VARCHAR(255),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        order_id_custom VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS parties (
        id SERIAL PRIMARY KEY,
        party_name VARCHAR(255),
        process_type VARCHAR(255),
        current_order VARCHAR(255),
        current_process VARCHAR(255),
        quantity_pcs INTEGER,
        status VARCHAR(50) DEFAULT 'active',
        size VARCHAR(255),
        party_id_custom VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id SERIAL PRIMARY KEY,
        material_name VARCHAR(255),
        stock_quantity INTEGER DEFAULT 0,
        unit VARCHAR(50),
        reserved_stock INTEGER DEFAULT 0,
        total_stock INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'In Stock',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS process_sequences (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255),
        process_name VARCHAR(255),
        process_type VARCHAR(255),
        sequence_number INTEGER,
        party_id INTEGER,
        input_qty DECIMAL(10,2) DEFAULT 0,
        output_qty DECIMAL(10,2) DEFAULT 0,
        rejection DECIMAL(10,2) DEFAULT 0,
        extra DECIMAL(10,2) DEFAULT 0,
        size VARCHAR(255),
        rate DECIMAL(10,2) DEFAULT 0,
        total_cost DECIMAL(10,2) DEFAULT 0,
        total_boxes DECIMAL(10,2) DEFAULT 0,
        cutting DECIMAL(10,2) DEFAULT 0,
        hole DECIMAL(10,2) DEFAULT 0,
        finishing VARCHAR(255),
        pieces_per_box DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Hardware ERP API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Orders routes
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { client_name, brand_name, product_name, quantity, delivery_location, notes, status } = req.body;
    
    // Generate custom order ID
    const lastOrder = await pool.query('SELECT id FROM orders ORDER BY id DESC LIMIT 1');
    const lastId = lastOrder.rows.length > 0 ? lastOrder.rows[0].id : 0;
    const order_id_custom = `ORD-${1000 + lastId + 1}`;
    
    const result = await pool.query(
      'INSERT INTO orders (client_name, brand_name, product_name, quantity, delivery_location, notes, status, order_id_custom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [client_name, brand_name, product_name, quantity, delivery_location, notes, status || 'Pending', order_id_custom]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { client_name, brand_name, product_name, quantity, delivery_location, notes, status } = req.body;
    const result = await pool.query(
      'UPDATE orders SET client_name = COALESCE($1, client_name), brand_name = COALESCE($2, brand_name), product_name = COALESCE($3, product_name), quantity = COALESCE($4, quantity), delivery_location = COALESCE($5, delivery_location), notes = COALESCE($6, notes), status = COALESCE($7, status) WHERE id = $8 RETURNING *',
      [client_name, brand_name, product_name, quantity, delivery_location, notes, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Parties routes
app.get('/api/parties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parties ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/parties/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parties WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Party not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/parties', async (req, res) => {
  try {
    const { party_name, process_type, current_order, current_process, quantity_pcs, status, size } = req.body;
    
    // Generate custom party ID
    const lastParty = await pool.query('SELECT id FROM parties ORDER BY id DESC LIMIT 1');
    const lastId = lastParty.rows.length > 0 ? lastParty.rows[0].id : 0;
    const party_id_custom = `PTY-${100 + lastId + 1}`;
    
    const result = await pool.query(
      'INSERT INTO parties (party_name, process_type, current_order, current_process, quantity_pcs, status, size, party_id_custom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [party_name, process_type, current_order, current_process, quantity_pcs, status || 'active', size, party_id_custom]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/parties/:id', async (req, res) => {
  try {
    const { party_name, process_type, current_order, current_process, quantity_pcs, status, size } = req.body;
    const result = await pool.query(
      'UPDATE parties SET party_name = COALESCE($1, party_name), process_type = COALESCE($2, process_type), current_order = COALESCE($3, current_order), current_process = COALESCE($4, current_process), quantity_pcs = COALESCE($5, quantity_pcs), status = COALESCE($6, status), size = COALESCE($7, size) WHERE id = $8 RETURNING *',
      [party_name, process_type, current_order, current_process, quantity_pcs, status, size, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Party not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/parties/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM parties WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Party not found' });
    }
    res.json({ success: true, message: 'Party deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Materials routes
app.get('/api/materials', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materials ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/materials/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materials WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/materials', async (req, res) => {
  try {
    const { material_name, stock_quantity, unit, reserved_stock, total_stock, status } = req.body;
    const calculatedTotalStock = total_stock || (stock_quantity + (reserved_stock || 0));
    
    const result = await pool.query(
      'INSERT INTO materials (material_name, stock_quantity, unit, reserved_stock, total_stock, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [material_name, stock_quantity, unit, reserved_stock || 0, calculatedTotalStock, status || 'In Stock']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/materials/:id', async (req, res) => {
  try {
    const { material_name, stock_quantity, unit, reserved_stock, total_stock, status } = req.body;
    const result = await pool.query(
      'UPDATE materials SET material_name = COALESCE($1, material_name), stock_quantity = COALESCE($2, stock_quantity), unit = COALESCE($3, unit), reserved_stock = COALESCE($4, reserved_stock), total_stock = COALESCE($5, total_stock), status = COALESCE($6, status) WHERE id = $7 RETURNING *',
      [material_name, stock_quantity, unit, reserved_stock, total_stock, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/materials/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM materials WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Process Sequences routes (NEW - This was missing)
app.get('/api/process-sequences', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM process_sequences ORDER BY sequence_number');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/process-sequences/order/:order_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM process_sequences WHERE order_id = $1 ORDER BY sequence_number', [req.params.order_id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/process-sequences/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM process_sequences WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Process sequence not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/process-sequences', async (req, res) => {
  try {
    const { order_id, process_name, process_type, sequence_number, party_id, input_qty, output_qty, rejection, extra, size, rate, total_cost, total_boxes, cutting, hole, finishing, pieces_per_box, status } = req.body;
    
    const result = await pool.query(
      'INSERT INTO process_sequences (order_id, process_name, process_type, sequence_number, party_id, input_qty, output_qty, rejection, extra, size, rate, total_cost, total_boxes, cutting, hole, finishing, pieces_per_box, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *',
      [order_id, process_name, process_type, sequence_number, party_id, input_qty || 0, output_qty || 0, rejection || 0, extra || 0, size, rate || 0, total_cost || 0, total_boxes || 0, cutting || 0, hole || 0, finishing, pieces_per_box || 0, status || 'pending']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/process-sequences/:id', async (req, res) => {
  try {
    const { order_id, process_name, process_type, sequence_number, party_id, input_qty, output_qty, rejection, extra, size, rate, total_cost, total_boxes, cutting, hole, finishing, pieces_per_box, status } = req.body;
    const result = await pool.query(
      'UPDATE process_sequences SET order_id = COALESCE($1, order_id), process_name = COALESCE($2, process_name), process_type = COALESCE($3, process_type), sequence_number = COALESCE($4, sequence_number), party_id = COALESCE($5, party_id), input_qty = COALESCE($6, input_qty), output_qty = COALESCE($7, output_qty), rejection = COALESCE($8, rejection), extra = COALESCE($9, extra), size = COALESCE($10, size), rate = COALESCE($11, rate), total_cost = COALESCE($12, total_cost), total_boxes = COALESCE($13, total_boxes), cutting = COALESCE($14, cutting), hole = COALESCE($15, hole), finishing = COALESCE($16, finishing), pieces_per_box = COALESCE($17, pieces_per_box), status = COALESCE($18, status) WHERE id = $19 RETURNING *',
      [order_id, process_name, process_type, sequence_number, party_id, input_qty, output_qty, rejection, extra, size, rate, total_cost, total_boxes, cutting, hole, finishing, pieces_per_box, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Process sequence not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/process-sequences/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM process_sequences WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Process sequence not found' });
    }
    res.json({ success: true, message: 'Process sequence deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/process-sequences/order/:order_id', async (req, res) => {
  try {
    await pool.query('DELETE FROM process_sequences WHERE order_id = $1', [req.params.order_id]);
    res.json({ success: true, message: 'Process sequences deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initDB().catch(err => {
    console.error('Error initializing database:', err);
  });
});
