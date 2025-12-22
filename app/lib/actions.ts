'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, 'Customer ID is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be at least 0.01'),
  status: z.enum(['paid', 'unpaid', 'pending']),
  date: z.string(),
});

const CreatedInvoice = InvoiceSchema.omit({id: true, date: true})

export async function createInvoice(data: FormData) {

   const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

    const { customerId, amount, status } = CreatedInvoice.parse({
        customerId: data.get('customerId') as string,
        amount: data.get('amount'),
        status: data.get('status') as string,
    });

    const amountInCents = amount * 100;
     const date = new Date().toISOString().split('T')[0];

     await sql`
       INSERT INTO invoices (customer_id, amount, status, date)
       VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
     `;

     revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');

//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
//     method: 'POST',
//     body: data,
//   });

//   if (!res.ok) {
//     throw new Error('Failed to create invoice');
//   }

//   return res.json();
}

export async function updateInvoice(data: FormData) {
   const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

   
}