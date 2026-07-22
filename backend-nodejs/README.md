# Hardware ERP Backend - Node.js

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend-nodejs
npm install
```

### 2. Configure Database
Copy `.env.example` to `.env` and add your database URL:

```
DATABASE_URL=postgresql://hardware_erp_user:password@host:port/hardware_erp
PORT=3000
```

### 3. Run Locally
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

API will be available at: `http://localhost:3000`

## API Endpoints

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Parties
- `GET /api/parties` - Get all parties
- `GET /api/parties/:id` - Get single party
- `POST /api/parties` - Create party
- `PUT /api/parties/:id` - Update party
- `DELETE /api/parties/:id` - Delete party

### Materials
- `GET /api/materials` - Get all materials
- `GET /api/materials/:id` - Get single material
- `POST /api/materials` - Create material
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material

### Process Sequences (NEW - Was Missing)
- `GET /api/process-sequences` - Get all process sequences
- `GET /api/process-sequences/order/:order_id` - Get sequences for an order
- `GET /api/process-sequences/:id` - Get single sequence
- `POST /api/process-sequences` - Create process sequence
- `PUT /api/process-sequences/:id` - Update process sequence
- `DELETE /api/process-sequences/:id` - Delete process sequence
- `DELETE /api/process-sequences/order/:order_id` - Delete all sequences for an order

## Deploy to Render

### Option 1: Using render.yaml (Automatic)
1. Push this backend to GitHub
2. Go to Render Dashboard
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml`

### Option 2: Manual Setup
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: hardware-erp-backend-nodejs
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add Environment Variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string
6. Deploy

## Database Schema

### Orders Table
- id (PK)
- client_name
- brand_name
- product_name
- quantity
- delivery_location
- notes
- status
- order_id_custom (unique)
- created_at

### Parties Table
- id (PK)
- party_name
- process_type
- current_order
- current_process
- quantity_pcs
- status
- size
- party_id_custom (unique)
- created_at

### Materials Table
- id (PK)
- material_name
- stock_quantity
- unit
- reserved_stock
- total_stock
- status
- created_at

### Process Sequences Table (NEW)
- id (PK)
- order_id
- process_name
- process_type
- sequence_number
- party_id (FK)
- input_qty
- output_qty
- rejection
- extra
- size
- rate
- total_cost
- total_boxes
- cutting
- hole
- finishing
- pieces_per_box
- status
- created_at

## Testing

### Test Locally
```bash
# Start server
npm start

# Test endpoints
curl http://localhost:3000/api/orders
curl http://localhost:3000/api/parties
curl http://localhost:3000/api/materials
curl http://localhost:3000/api/process-sequences
```

## Frontend Integration

Update frontend API base URL in `src/api/api.ts`:
```typescript
const API_BASE_URL = "https://your-render-backend-url.onrender.com/api";
```

## Troubleshooting

### Database Connection Error
- Check DATABASE_URL in .env file
- Ensure PostgreSQL is running
- Verify credentials

### Port Already in Use
- Change PORT in .env file
- Or kill process using port 3000
