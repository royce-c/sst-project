import React from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
// import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/all-expenses")({
  component: AllExpenses,
});

type Expense = {
  id: number;
  title: string;
  amount: number;
  date: string;
  imageUrl?: string;
};

function AllExpenses() {
  const { getToken } = useKindeAuth();

  async function getAllExpenses() {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const res = await fetch(import.meta.env.VITE_APP_API_URL + "/expenses", {
      headers: {
        Authorization: token,
      },
    });
    if (!res.ok) {
      throw new Error("Something went wrong");
    }
    return (await res.json()) as { expenses: Expense[] };
  }

  const { isPending, error, data } = useQuery({
    queryKey: ["getAllExpenses"],
    queryFn: getAllExpenses,
  });

  console.log(data);

  return (
    <>
      {/* <h1 className="text-2xl">All Expenses</h1> */}
      {error ? (
        "An error has occurred: " + error.message
      ) : (
        <Table>
          <TableCaption>A list of your recent expenses.</TableCaption>
          <TableHeader>
            {/* <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow> */}
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow key="loading">
                <TableCell className="font-medium">
                  <Skeleton className="h-4 w-full"></Skeleton>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full"></Skeleton>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full"></Skeleton>
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-full"></Skeleton>
                </TableCell>
              </TableRow>
            ) : (
              data.expenses
                .slice()
                .reverse()
                .map((expense, index) => (
                  <React.Fragment key={`expense-${index}`}>
                    {/* <TableRow> */}
                    {/* <TableCell>{expense.date.split("T")[0]}</TableCell>
                    <TableCell>
                      {formatCurrency(expense.amount)}
                    </TableCell> */}
                    {/* <TableCell> */}
                    <div className="p-4">
                      {" "}
                      {/* Add padding here */}
                      {expense.imageUrl && (
                        <img
                          className="w-60 h-60 object-cover rounded-lg mx-auto"
                          src={expense.imageUrl}
                          alt={expense.title}
                        />
                      )}
                    </div>
                    {/* </TableCell> */}
                    {/* </TableRow> */}
                    <TableRow>
                      <TableCell className="font-medium" colSpan={3}>
                        {expense.title} Date: {expense.date.split("T")[0]}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
            )}
          </TableBody>
        </Table>
      )}
    </>
  );
}
