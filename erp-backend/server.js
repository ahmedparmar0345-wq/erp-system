import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import db from './db.js';
import authRouter from './routes/auth.js';
import customersRouter from './routes/customers.js';
import productsRouter from './routes/products.js';
import salesOrdersRoutes from './routes/sales-orders.js';
import suppliersRouter from './routes/suppliers.js';
import purchaseOrdersRouter from './routes/purchase-orders.js';
import expensesRouter from './routes/expenses.js';
import accountingRouter from './routes/accounting.js';
import hrRouter from './routes/hr.js';
import returnsRouter from './routes/returns.js';
import settingsRouter from './routes/settings.js';
import posRouter from './routes/pos.js';
import reportsRouter from './routes/reports.js';
import productionRouter from './routes/production.js';
import accountingReportsRouter from './routes/accounting-reports.js';
import crmRouter from './routes/crm.js';
import warehousesRouter from './routes/warehouses.js';
import accountingEnhancementsRouter from './routes/accounting-enhancements.js';
import invoicesRouter from './routes/invoices.js';
import fixedAssetsRouter from './routes/fixed-assets.js';
import projectsRouter from './routes/projects.js';
import approvalsRouter from './routes/approvals.js';
import quotationsRouter from './routes/quotations.js';
import servicesRouter from './routes/services.js';
import serviceInvoicesRouter from './routes/service-invoices.js';
import taxRouter from './routes/tax.js';
import barcodeRouter from './routes/barcode.js';
import aiBiRouter from './routes/ai-bi.js';

dotenv.config();

const app = express();
const DEFAULT_PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales-orders', salesOrdersRoutes);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/purchase-orders', purchaseOrdersRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/accounting', accountingRouter);
app.use('/api/hr', hrRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/pos', posRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/production', productionRouter);
app.use('/api/accounting-reports', accountingReportsRouter);
app.use('/api/crm', crmRouter);
app.use('/api/warehouses', warehousesRouter);
app.use('/api/accounting-enhancements', accountingEnhancementsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/fixed-assets', fixedAssetsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/quotations', quotationsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/service-invoices', serviceInvoicesRouter);
app.use('/api/tax', taxRouter);
app.use('/api/barcode', barcodeRouter);
app.use('/api/ai-bi', aiBiRouter);

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Permanent port conflict solution - automatically finds available port
const startServer = (port, maxAttempts = 5) => {
  let attempts = 0;

  const tryListen = (currentPort) => {
    const server = app.listen(currentPort, () => {
      console.log(`✅ ERP Server running on port ${currentPort}`);
      if (currentPort !== DEFAULT_PORT) {
        console.log(`⚠️ Port ${DEFAULT_PORT} was busy, automatically using port ${currentPort}`);
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempts < maxAttempts) {
        attempts++;
        const nextPort = currentPort + 1;
        console.log(`⚠️ Port ${currentPort} is busy, trying port ${nextPort}...`);
        tryListen(nextPort);
      } else if (err.code === 'EADDRINUSE') {
        console.error(`❌ Failed to find available port after ${maxAttempts} attempts`);
        console.error('Please close some applications or manually kill processes using ports:');
        console.error(`- Run: netstat -ano | findstr :${DEFAULT_PORT}`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  };

  tryListen(port);
};

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server with automatic port handling
startServer(DEFAULT_PORT);