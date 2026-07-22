# Database Schema for Process Sequences

## Current Tables (Existing)
- orders
- parties
- inventory

## New Table: process_sequences

### Table Structure
```sql
CREATE TABLE process_sequences (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  process_name VARCHAR(255) NOT NULL,
  process_type VARCHAR(100) NOT NULL,
  sequence_number INTEGER NOT NULL,
  party_id INTEGER REFERENCES parties(id),
  
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
```

## API Endpoints Needed

### 1. Get Process Sequences for an Order
```
GET /api/process-sequences/order/:orderId
Response: {
  success: true,
  data: [
    {
      id: 1,
      order_id: "ORD001",
      process_name: "Cutting",
      process_type: "cutting",
      sequence_number: 1,
      party_id: 1,
      input_qty: 1000,
      output_qty: 950,
      rejection: 50,
      extra: 0,
      size: "10x20",
      rate: 5.50,
      total_cost: 5225.00,
      total_boxes: 0,
      status: "completed"
    }
  ]
}
```

### 2. Create Process Sequence
```
POST /api/process-sequences
Body: {
  order_id: "ORD001",
  process_name: "Cutting",
  process_type: "cutting",
  sequence_number: 1,
  party_id: 1,
  input_qty: 1000,
  output_qty: 950,
  rejection: 50,
  extra: 0,
  size: "10x20",
  rate: 5.50,
  total_cost: 5225.00,
  total_boxes: 0,
  status: "pending"
}
Response: {
  success: true,
  data: { id: 1, ... }
}
```

### 3. Update Process Sequence
```
PUT /api/process-sequences/:id
Body: {
  input_qty: 1000,
  output_qty: 950,
  rejection: 50,
  extra: 0,
  status: "completed"
}
Response: {
  success: true,
  data: { ... }
}
```

### 4. Delete Process Sequence
```
DELETE /api/process-sequences/:id
Response: {
  success: true,
  message: "Process sequence deleted"
}
```

### 5. Delete All Process Sequences for an Order
```
DELETE /api/process-sequences/order/:orderId
Response: {
  success: true,
  message: "All process sequences deleted"
}
```

## Field Descriptions

- **id**: Unique identifier for the process sequence
- **order_id**: Reference to the order (order_id_custom from orders table)
- **process_name**: Display name of the process (e.g., "Cutting", "Polishing")
- **process_type**: Type identifier (e.g., "cutting", "polishing", "packing", "custom")
- **sequence_number**: Order in which this process should be executed (1, 2, 3...)
- **party_id**: Reference to the party assigned to this process
- **input_qty**: Quantity of items entering this process
- **output_qty**: Quantity of items after processing
- **rejection**: Number of rejected/scrap items
- **extra**: Extra items added to inventory
- **size**: Size specification (if applicable)
- **rate**: Rate per piece for cost calculation
- **total_cost**: Total cost for this process (rate * output_qty)
- **total_boxes**: Number of boxes (for packing process)
- **cutting**: Cutting quantity (for cutting process)
- **status**: Current status (pending, in_progress, completed)
- **created_at**: Timestamp when record was created
- **updated_at**: Timestamp when record was last updated

## Indexes to Add
```sql
CREATE INDEX idx_process_sequences_order_id ON process_sequences(order_id);
CREATE INDEX idx_process_sequences_party_id ON process_sequences(party_id);
CREATE INDEX idx_process_sequences_sequence ON process_sequences(order_id, sequence_number);
```
