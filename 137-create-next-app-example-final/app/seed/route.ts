import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

// 增加連接選項，提高穩定性
const sql = postgres(process.env.POSTGRES_URL!, { 
  ssl: 'require',
  idle_timeout: 20,
  connect_timeout: 15
});

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  // 改為串行執行，避免預處理語句衝突
  for (const user of users) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    } catch (error) {
      console.error(`Error inserting user ${user.name}:`, error);
    }
  }

  return { success: true };
}

async function seedInvoices() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  // 改為串行執行，避免預處理語句衝突
  for (const invoice of invoices) {
    try {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `;
    } catch (error) {
      console.error(`Error inserting invoice:`, error);
    }
  }

  return { success: true };
}

async function seedCustomers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  // 改為串行執行，避免預處理語句衝突
  for (const customer of customers) {
    try {
      await sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `;
    } catch (error) {
      console.error(`Error inserting customer ${customer.name}:`, error);
    }
  }

  return { success: true };
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  // 改為串行執行，避免預處理語句衝突
  for (const rev of revenue) {
    try {
      await sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `;
    } catch (error) {
      console.error(`Error inserting revenue for month ${rev.month}:`, error);
    }
  }

  return { success: true };
}

export async function GET() {
  try {
    // 拆分為獨立操作執行，避免一個大事務超時
    await seedUsers().catch(error => console.error('Error seeding users:', error));
    await seedCustomers().catch(error => console.error('Error seeding customers:', error));
    await seedInvoices().catch(error => console.error('Error seeding invoices:', error));
    await seedRevenue().catch(error => console.error('Error seeding revenue:', error));

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error }, { status: 500 });
  }
} 