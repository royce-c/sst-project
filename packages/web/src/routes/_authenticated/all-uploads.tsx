import React from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/all-uploads")({
  component: Alluploads,
});

type Upload = {
  id: number;
  title: string;
  description: number;
  date: string;
  imageUrl?: string;
};

function Alluploads() {
  const { getToken } = useKindeAuth();

  async function getAlluploads() {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const res = await fetch(import.meta.env.VITE_APP_API_URL + "/uploads", {
      headers: {
        Authorization: token,
      },
    });
    if (!res.ok) {
      throw new Error("Something went wrong");
    }
    return (await res.json()) as { uploads: Upload[] };
  }

  async function deleteUpload(id: number) {
    const token = await getToken();
    try {
      if (!token) {
        throw new Error("No token found");
      }
      const res = await fetch(import.meta.env.VITE_APP_API_URL + "/uploads", {
        method: "DELETE",
        body: JSON.stringify({ uploadId: id }),
        headers: {
          Authorization: token,
        },
      });
      const data = await res.json();
      console.log("data: " + data);
    } catch (error) {
      console.error("Error deleting upload:", error);
    }
  }

  const { isPending, error, data } = useQuery({
    queryKey: ["getAlluploads"],
    queryFn: getAlluploads,
  });

  console.log(data);

  return (
    <>
      {error ? (
        "An error has occurred: " + error.message
      ) : (
        <Table>
          {/* <TableCaption>A list of your recent uploads.</TableCaption> */}
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
              data.uploads
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((upload, index) => (
                  <React.Fragment key={`upload-${index}`}>
                    <div className="font-bold font-large text-center p-3">
                      {upload.description}
                    </div>

                    <div className="p-4">
                      {upload.imageUrl && (
                        <img
                          className="w-60 h-60 object-cover rounded-lg mx-auto"
                          src={upload.imageUrl}
                          alt={upload.title}
                        />
                      )}
                    </div>

                    <div className="flex items-center">
                      <p className="mr-2 flex-grow"></p>
                      <p className="text-right">{upload.date.split("T")[0]}</p>
                    </div>

                    <TableRow>
                      <TableCell className="font-medium p-3" colSpan={3}>
                        {upload.title}
                        <button
                          onClick={() => deleteUpload(upload.id)}
                          className="h-4 w-4"
                        >
                          {" "}
                          Delete
                        </button>
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
