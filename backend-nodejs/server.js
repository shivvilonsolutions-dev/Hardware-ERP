const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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
        surface_finishes VARCHAR(255),  
        model VARCHAR(255),             
        size VARCHAR(255),              
        status VARCHAR(50) DEFAULT 'Pending',
        order_id_custom VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS quantity INTEGER,
        ADD COLUMN IF NOT EXISTS delivery_location VARCHAR(255),
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS surface_finishes VARCHAR(255),
        ADD COLUMN IF NOT EXISTS model VARCHAR(255),
        ADD COLUMN IF NOT EXISTS size VARCHAR(255),
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending',
        ADD COLUMN IF NOT EXISTS order_id_custom VARCHAR(50) UNIQUE,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `).catch(() => { });

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
        low_stock_threshold INTEGER DEFAULT 30,
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
        size_unit VARCHAR(50) DEFAULT 'Pieces',
        kg DECIMAL(10,2) DEFAULT 0,
        pieces DECIMAL(10,2) DEFAULT 0,
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS process_inventory (
        id SERIAL PRIMARY KEY,
        party_name VARCHAR(255),
        order_name VARCHAR(255),
        order_date VARCHAR(255),
        process_name VARCHAR(255),
        quantity INTEGER DEFAULT 0,
        unit VARCHAR(50),
        status VARCHAR(50) DEFAULT 'In Process',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`ALTER TABLE materials ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 30;`).catch(() => { });
    await pool.query(`ALTER TABLE materials ADD COLUMN IF NOT EXISTS size VARCHAR(255), ADD COLUMN IF NOT EXISTS finish VARCHAR(255);`).catch(() => { });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_boxes (
        id SERIAL PRIMARY KEY,
        box_size VARCHAR(255),
        brand_name VARCHAR(255),
        quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_fittings (
        id SERIAL PRIMARY KEY,
        fitting_name VARCHAR(255),
        size VARCHAR(255),
        quantity INTEGER DEFAULT 0,
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
    const { client_name, brand_name, product_name, quantity, delivery_location, notes, model, size, status } = req.body;
    const surface_finishes = req.body.surface_finishes || req.body.surfaceFinishes;

    // Generate custom order ID
    const lastOrder = await pool.query('SELECT id FROM orders ORDER BY id DESC LIMIT 1');
    const lastId = lastOrder.rows.length > 0 ? lastOrder.rows[0].id : 0;
    const order_id_custom = `ORD-${1000 + lastId + 1}`;

    const result = await pool.query(
      'INSERT INTO orders (client_name, brand_name, product_name, quantity, delivery_location, notes, surface_finishes, model, size, status, order_id_custom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [client_name, brand_name, product_name, quantity, delivery_location, notes, surface_finishes, model, size, status || 'Pending', order_id_custom]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { client_name, brand_name, product_name, quantity, delivery_location, notes, model, size, status } = req.body;
    const surface_finishes = req.body.surface_finishes || req.body.surfaceFinishes;
    const result = await pool.query(
      'UPDATE orders SET client_name = COALESCE($1, client_name), brand_name = COALESCE($2, brand_name), product_name = COALESCE($3, product_name), quantity = COALESCE($4, quantity), delivery_location = COALESCE($5, delivery_location), notes = COALESCE($6, notes), surface_finishes = COALESCE($7, surface_finishes), model = COALESCE($8, model), size = COALESCE($9, size), status = COALESCE($10, status) WHERE id = $11 RETURNING *',
      [client_name, brand_name, product_name, quantity, delivery_location, notes, surface_finishes, model, size, status, req.params.id]
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
    const { material_name, stock_quantity, unit, reserved_stock, total_stock, status, low_stock_threshold, size, finish } = req.body;
    const calculatedTotalStock = total_stock || (stock_quantity + (reserved_stock || 0));

    const result = await pool.query(
      'INSERT INTO materials (material_name, stock_quantity, unit, reserved_stock, total_stock, status, low_stock_threshold, size, finish) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [material_name, stock_quantity, unit, reserved_stock || 0, calculatedTotalStock, status || 'In Stock', low_stock_threshold || 30, size, finish]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/materials/:id', async (req, res) => {
  try {
    const { material_name, stock_quantity, unit, reserved_stock, total_stock, status, low_stock_threshold, size, finish } = req.body;
    const result = await pool.query(
      'UPDATE materials SET material_name = COALESCE($1, material_name), stock_quantity = COALESCE($2, stock_quantity), unit = COALESCE($3, unit), reserved_stock = COALESCE($4, reserved_stock), total_stock = COALESCE($5, total_stock), status = COALESCE($6, status), low_stock_threshold = COALESCE($7, low_stock_threshold), size = COALESCE($8, size), finish = COALESCE($9, finish) WHERE id = $10 RETURNING *',
      [material_name, stock_quantity, unit, reserved_stock, total_stock, status, low_stock_threshold, size, finish, req.params.id]
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

// Process Inventory routes
app.get('/api/process-inventory', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM process_inventory ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/process-inventory/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM process_inventory WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Process inventory item not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/process-inventory', async (req, res) => {
  try {
    const { party_name, order_name, order_date, process_name, quantity, unit, status } = req.body;
    const result = await pool.query(
      'INSERT INTO process_inventory (party_name, order_name, order_date, process_name, quantity, unit, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [party_name, order_name, order_date, process_name, quantity || 0, unit, status || 'In Process']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/process-inventory/:id', async (req, res) => {
  try {
    const { party_name, order_name, order_date, process_name, quantity, unit, status } = req.body;
    const result = await pool.query(
      'UPDATE process_inventory SET party_name = COALESCE($1, party_name), order_name = COALESCE($2, order_name), order_date = COALESCE($3, order_date), process_name = COALESCE($4, process_name), quantity = COALESCE($5, quantity), unit = COALESCE($6, unit), status = COALESCE($7, status) WHERE id = $8 RETURNING *',
      [party_name, order_name, order_date, process_name, quantity, unit, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Process inventory item not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/process-inventory/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM process_inventory WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Process inventory item not found' });
    }
    res.json({ success: true, message: 'Process inventory item deleted successfully' });
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
    const { order_id, process_name, process_type, sequence_number, party_id, input_qty, output_qty, rejection, extra, size, size_unit, kg, pieces, rate, total_cost, total_boxes, cutting, hole, finishing, pieces_per_box, status } = req.body;

    const result = await pool.query(
      'INSERT INTO process_sequences (order_id, process_name, process_type, sequence_number, party_id, input_qty, output_qty, rejection, extra, size, size_unit, kg, pieces, rate, total_cost, total_boxes, cutting, hole, finishing, pieces_per_box, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *',
      [order_id, process_name, process_type, sequence_number, party_id, input_qty || 0, output_qty || 0, rejection || 0, extra || 0, size, size_unit || 'Pieces', kg || 0, pieces || 0, rate || 0, total_cost || 0, total_boxes || 0, cutting || 0, hole || 0, finishing, pieces_per_box || 0, status || 'pending']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/process-sequences/:id', async (req, res) => {
  try {
    const { order_id, process_name, process_type, sequence_number, party_id, input_qty, output_qty, rejection, extra, size, size_unit, kg, pieces, rate, total_cost, total_boxes, cutting, hole, finishing, pieces_per_box, status } = req.body;
    const result = await pool.query(
      'UPDATE process_sequences SET order_id = COALESCE($1, order_id), process_name = COALESCE($2, process_name), process_type = COALESCE($3, process_type), sequence_number = COALESCE($4, sequence_number), party_id = COALESCE($5, party_id), input_qty = COALESCE($6, input_qty), output_qty = COALESCE($7, output_qty), rejection = COALESCE($8, rejection), extra = COALESCE($9, extra), size = COALESCE($10, size), size_unit = COALESCE($11, size_unit), kg = COALESCE($12, kg), pieces = COALESCE($13, pieces), rate = COALESCE($14, rate), total_cost = COALESCE($15, total_cost), total_boxes = COALESCE($16, total_boxes), cutting = COALESCE($17, cutting), hole = COALESCE($18, hole), finishing = COALESCE($19, finishing), pieces_per_box = COALESCE($20, pieces_per_box), status = COALESCE($21, status) WHERE id = $22 RETURNING *',
      [order_id, process_name, process_type, sequence_number, party_id, input_qty, output_qty, rejection, extra, size, size_unit, kg, pieces, rate, total_cost, total_boxes, cutting, hole, finishing, pieces_per_box, status, req.params.id]
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

// Inventory Boxes Routes
app.get('/api/boxes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory_boxes ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/boxes', async (req, res) => {
  try {
    const { box_size, brand_name, quantity } = req.body;
    const result = await pool.query(
      'INSERT INTO inventory_boxes (box_size, brand_name, quantity) VALUES ($1, $2, $3) RETURNING *',
      [box_size, brand_name, quantity || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/boxes/:id', async (req, res) => {
  try {
    const { box_size, brand_name, quantity } = req.body;
    const result = await pool.query(
      'UPDATE inventory_boxes SET box_size = COALESCE($1, box_size), brand_name = COALESCE($2, brand_name), quantity = COALESCE($3, quantity) WHERE id = $4 RETURNING *',
      [box_size, brand_name, quantity, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Box not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/boxes/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory_boxes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Box not found' });
    res.json({ success: true, message: 'Box deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Inventory Fittings Routes
app.get('/api/fittings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory_fittings ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/fittings', async (req, res) => {
  try {
    const { fitting_name, size, quantity } = req.body;
    const result = await pool.query(
      'INSERT INTO inventory_fittings (fitting_name, size, quantity) VALUES ($1, $2, $3) RETURNING *',
      [fitting_name, size, quantity || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/fittings/:id', async (req, res) => {
  try {
    const { fitting_name, size, quantity } = req.body;
    const result = await pool.query(
      'UPDATE inventory_fittings SET fitting_name = COALESCE($1, fitting_name), size = COALESCE($2, size), quantity = COALESCE($3, quantity) WHERE id = $4 RETURNING *',
      [fitting_name, size, quantity, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Fitting not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/fittings/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory_fittings WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Fitting not found' });
    res.json({ success: true, message: 'Fitting deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

startServer();
