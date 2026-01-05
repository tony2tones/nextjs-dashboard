"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { sign } from "crypto";

export type State = {
  message?: string | null;
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  values?: {
    customerId?: string;
    amount?: string;
    status?: string;
  };
};

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer",
  }),
  amount: z.coerce.number().gt(0, { message: "Amount must be greater than 0" }),
  status: z.enum(["paid", "unpaid", "pending"], {
    invalid_type_error: "Please select a status",
  }),
  date: z.string(),
});

export async function authenticate(prevState: State, data: FormData) {
  try {
    await signIn("credentials", FormData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.message) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

const CreatedInvoice = InvoiceSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function createInvoice(prevState: State, data: FormData) {
  const validatedFields = CreatedInvoice.safeParse({
    customerId: data.get("customerId") as string,
    amount: data.get("amount"),
    status: data.get("status") as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
      values: {
        customerId: data.get("customerId") as string,
        amount: data.get("amount") as string,
        status: data.get("status") as string,
      },
    };
  }

  const { amount, customerId, status } = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error("There was an error creating the invoice.");
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");

  //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
  //     method: 'POST',
  //     body: data,
  //   });

  //   if (!res.ok) {
  //     throw new Error('Failed to create invoice');
  //   }

  //   return res.json();
}

export async function updateInvoice(id: string, data: FormData): Promise<void> {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: data.get("customerId") as string,
    amount: data.get("amount"),
    status: data.get("status") as string,
  });

  const amountInCents = amount * 100;
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId},
            amount = ${amountInCents},
            status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    console.log("Error updating invoice:", error);
    throw new Error("There was an error updating the invoice.");
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string): Promise<void> {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    throw new Error("There was an error deleting the invoice.");
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
