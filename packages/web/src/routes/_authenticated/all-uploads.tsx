import React from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useQuery,
  useQueryClient,
  InvalidateQueryFilters,
} from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarOutline, faStar as faStarFilled } from "@fortawesome/free-regular-svg-icons";

export const Route = createFileRoute("/_authenticated/all-uploads")({
  component: Alluploads,
});

type Upload = {
  id: number;
  userId: number;
  title: string;
  description: number;
  date: string;
  imageUrl?: string;
  favorited: boolean;
};

function Alluploads() {
  const { getToken } = useKindeAuth();
  const queryClient = useQueryClient(); // Create a queryClient instance

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
      if (!res.ok) {
        throw new Error("Failed to delete upload");
      }
      console.log("Upload deleted successfully");
      // Update local state or refetch data to reflect the deletion
      queryClient.invalidateQueries([
        "getAlluploads",
      ] as InvalidateQueryFilters);
    } catch (error) {
      console.error("Error deleting upload:", error);
    }
  }

  async function toggleFavorite(id: number, userId: number) {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const res = await fetch(import.meta.env.VITE_APP_API_URL + "/favorites", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, uploadId: id }),
    });
    if (!res.ok) {
      throw new Error("Failed to toggle favorite");
    }
    console.log("Favorite toggled successfully");
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

                    <TableRow>
                      <TableCell className="font-medium p-3" colSpan={3}>
                        <div className="flex items-center">
                          <p className="mr-2 flex-grow"></p>
                          <p className="text-right pb-4">
                            {upload.date.split("T")[0]}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <div className="pb-2">{upload.title}</div>
                          <div className="flex justify-between mt-2">
                            <button
                              onClick={() =>
                                toggleFavorite(upload.id, upload.userId)
                              }
                              className="h-4 w-12 text-gray-500"
                            >
                              <FontAwesomeIcon icon={upload.favorited ? faStarFilled : faStarOutline} />
                            </button>
                            <button
                              onClick={() => deleteUpload(upload.id)}
                              className="h-4 w-12 text-gray-500"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
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
