# Backend API Implementation Guide

## Prerequisites
- Node.js backend with Express
- PostgreSQL database (or your current database)
- Existing tables: orders, parties, inventory

## Step 1: Create Database Migration

```sql
-- Run this in your database to create the process_sequences table
CREATE TABLE IF NOT EXISTS process_sequences (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  process_name VARCHAR(255) NOT NULL,
  process_type VARCHAR(100) NOT NULL,
  sequence_number INTEGER NOT NULL,
  party_id INTEGER,
  
  -- Process Fields
  input_qty INTEGER DEFAULT 0,
  output_qty INTEGER DEFAULT 0,
  rejection INTEGER DEFAULT 0,
  extra INTEGER DEFAULT 0,
  size VARCHAR(100),
  rate DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),
  total_boxes INTEGER DEFAULT 0,
  cutting INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (order_id) REFERENCES orders(order_id_custom) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_process_sequences_order_id ON process_sequences(order_id);
CREATE INDEX IF NOT EXISTS idx_process_sequences_party_id ON process_sequences(party_id);
CREATE INDEX IF NOT EXISTS idx_process_sequences_sequence ON process_sequences(order_id, sequence_number);
```

## Step 2: Create Process Sequence Model

```javascript
// models/ProcessSequence.js
const db = require('../config/database');

class ProcessSequence {
  static async getByOrderId(orderId) {
    const query = `
      SELECT ps.*, p.party_name 
      FROM process_sequences ps
      LEFT JOIN parties p ON ps.party_id = p.id
      WHERE ps.order_id = $1
      ORDER BY ps.sequence_number ASC
    `;
    const result = await db.query(query, [orderId]);
    return result.rows;
  }

  static async create(data) {
    const query = `
      INSERT INTO process_sequences (
        order_id, process_name, process_type, sequence_number, party_id,
        input_qty, output_qty, rejection, extra, size, rate, total_cost,
        total_boxes, cutting, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const values = [
      data.order_id, data.process_name, data.process_type, data.sequence_number,
      data.party_id, data.input_qty, data.output_qty, data.rejection, data.extra,
      data.size, data.rate, data.total_cost, data.total_boxes, data.cutting,
      data.status
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(id, data) {
    const query = `
      UPDATE process_sequences
      SET 
        input_qty = COALESCE($1, input_qty),
        output_qty = COALESCE($2, output_qty),
        rejection = COALESCE($3, rejection),
        extra = COALESCE($4, extra),
        size = COALESCE($5, size),
        rate = COALESCE($6, rate),
        total_cost = COALESCE($7, total_cost),
        total_boxes = COALESCE($8, total_boxes),
        cutting = COALESCE($9, cutting),
        status = COALESCE($10, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;
    const values = [
      data.input_qty, data.output_qty, data.rejection, data.extra,
      data.size, data.rate, data.total_cost, data.total_boxes, data.cutting,
      data.status, id
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM process_sequences WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async deleteByOrderId(orderId) {
    const query = 'DELETE FROM process_sequences WHERE order_id = $1';
    await db.query(query, [orderId]);
  }
}

module.exports = ProcessSequence;
```

## Step 3: Create API Routes

```javascript
// routes/processSequences.js
const express = require('express');
const router = express.Router();
const ProcessSequence = require('../models/ProcessSequence');

// Get all process sequences for an order
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const sequences = await ProcessSequence.getByOrderId(orderId);
    res.json({ success: true, data: sequences });
  } catch (error) {
    console.error('Error fetching process sequences:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new process sequence
router.post('/', async (req, res) => {
  try {
    const sequence = await ProcessSequence.create(req.body);
    res.status(201).json({ success: true, data: sequence });
  } catch (error) {
    console.error('Error creating process sequence:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a process sequence
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sequence = await ProcessSequence.update(id, req.body);
    res.json({ success: true, data: sequence });
  } catch (error) {
    console.error('Error updating process sequence:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a process sequence
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await ProcessSequence.delete(id);
    res.json({ success: true, message: 'Process sequence deleted' });
  } catch (error) {
    console.error('Error deleting process sequence:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete all process sequences for an order
router.delete('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    await ProcessSequence.deleteByOrderId(orderId);
    res.json({ success: true, message: 'All process sequences deleted' });
  } catch (error) {
    console.error('Error deleting process sequences:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

## Step 4: Register Routes in Main App

```javascript
// In your main app.js or index.js
const processSequencesRouter = require('./routes/processSequences');

app.use('/api/process-sequences', processSequencesRouter);
```

## Step 5: Test the Endpoints

### Test with cURL or Postman:

```bash
# Get process sequences for an order
curl https://shivvilon-solution-manufacturing-project.onrender.com/api/process-sequences/order/ORD001

# Create a process sequence
curl -X POST https://shivvilon-solution-manufacturing-project.onrender.com/api/process-sequences \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD001",
    "process_name": "Cutting",
    "process_type": "cutting",
    "sequence_number": 1,
    "party_id": 1,
    "input_qty": 1000,
    "output_qty": 950,
    "rejection": 50,
    "extra": 0,
    "size": "10x20",
    "rate": 5.50,
    "total_cost": 5225.00,
    "total_boxes": 0,
    "status": "pending"
  }'

# Update a process sequence
curl -X PUT https://shivvilon-solution-manufacturing-project.onrender.com/api/process-sequences/1 \
  -H "Content-Type: application/json" \
  -d '{
    "output_qty": 950,
    "rejection": 50,
    "status": "completed"
  }'

# Delete a process sequence
curl -X DELETE https://shivvilon-solution-manufacturing-project.onrender.com/api/process-sequences/1
```

## Next Steps

After implementing the backend:
1. Deploy the updated backend to Render
2. Update the frontend Process.tsx to call these APIs
3. Add save functionality to persist process sequences
4. Test the full flow from frontend to database
