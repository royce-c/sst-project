import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodValidator } from "@tanstack/zod-form-adapter";
// import { Calendar } from "@/components/ui/calendar";

import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { useNavigate } from "@tanstack/react-router";

import { createFileRoute } from "@tanstack/react-router";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export const Route = createFileRoute("/_authenticated/new-upload")({
  component: NewuploadPage,
});

type Upload = {
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
};

function NewuploadPage() {
  const { getToken } = useKindeAuth();
  const navigate = useNavigate({ from: "/new-upload" });

  const [filePreviewURL, setFilePreviewURL] = useState<string | undefined>();

  const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const analyzeImage = async (file: File) => {
    let body = "";
    const value = "Return the text content of the image";
    if (file) {
      const base64 = await convertFileToBase64(file);

      const contentForAI = [
        {
          type: "text",
          text: value,
        },
        {
          type: "image_url",
          image_url: {
            url: base64,
          },
        },
      ];
      body = JSON.stringify({ content: contentForAI });
    } else {
      body = JSON.stringify({ content: value });
    }

    const token = await getToken();

    const headers = new Headers();
    headers.append("Authorization", token || "");
    headers.append("Content-Type", "application/json");

    const res = await fetch(import.meta.env.VITE_APP_API_URL + "/ai", {
      method: "POST",
      body: body,
      headers: headers,
    });

    const completionResult = await res.text();
    // console.log("Completion Result:", completionResult);
    return completionResult;
  };

  const mutation = useMutation({
    mutationFn: async ({ data, image }: { data: Upload; image?: File }) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No token found");
      }

      if (image) {
        const signedURLResponse = await fetch(
          import.meta.env.VITE_APP_API_URL + "/signed-url",
          {
            method: "POST",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contentType: image.type,
              contentLength: image.size,
              checksum: await computeSHA256(image),
            }),
          }
        );
        if (!signedURLResponse.ok) {
          throw new Error("An error occurred while creating the upload");
        }
        const { url } = (await signedURLResponse.json()) as { url: string };

        await fetch(url, {
          method: "PUT",
          body: image,
          headers: {
            "Content-Type": image.type,
          },
        });

        const imageUrl = url.split("?")[0];
        data.imageUrl = imageUrl;
      }

      const res = await fetch(import.meta.env.VITE_APP_API_URL + "/uploads", {
        method: "POST",
        body: JSON.stringify({ upload: data }),
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("An error occurred while creating the upload");
      }
      const json = await res.json();
      return json.upload;
    },
  });

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      image: undefined as undefined | File,
    },
    onSubmit: async ({ value }) => {
      let analysisResult = "initial";
      if (value.image) {
        const result = await analyzeImage(value.image);
        analysisResult = result;
        console.log("Analysis Result: ", analysisResult);
      }

      const data = {
        description: value.description,
        title: analysisResult,
        date: value.date.toISOString().split("T")[0],
      };

      await mutation.mutateAsync({ data, image: value.image });

      navigate({ to: "/all-uploads" });
    },
    validatorAdapter: zodValidator,
  });

  return (
    <>
      {/* <h1 className="text-2xl">New Upload</h1> */}
      {mutation.isError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      )}
      <form.Provider>
        <form
          className="flex flex-col gap-y-10"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          {/* <div>
            <form.Field
              name="title"
              children={(field) => (
                <Label>
                  Title
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors && (
                    <em role="alert">{field.state.meta.errors.join(", ")}</em>
                  )}
                </Label>
              )}
            />
          </div> */}
          <div>
            <form.Field
              name="description"
              children={(field) => (
                <Label>
                  <p className="py-4 px-1">
                    Write a Title
                  </p>
                  <Input
                    type="string"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors && (
                    <em role="alert">{field.state.meta.errors.join(", ")}</em>
                  )}
                </Label>
              )}
            />
          </div>

          {/* <div className="self-center">
            <form.Field
              name="date"
              children={(field) => (
                <Calendar
                  mode="single"
                  selected={field.state.value}
                  onSelect={(date) => field.handleChange(date || new Date())}
                  className="rounded-md border"
                />
              )}
            />
          </div> */}

          <div>
            <form.Field
              name="image"
              children={(field) => (
                <Label>
                  <p className="py-4 px-1">
                    Upload Image to be Analyzed
                  </p>
                  {filePreviewURL && (
                    <img className="max-w-40 m-auto" src={filePreviewURL} />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (filePreviewURL) {
                        URL.revokeObjectURL(filePreviewURL);
                      }
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setFilePreviewURL(url);
                      } else {
                        setFilePreviewURL(undefined);
                      }
                      field.handleChange(file);
                    }}
                  />
                  {field.state.meta.errors && (
                    <em role="alert">{field.state.meta.errors.join(", ")}</em>
                  )}
                </Label>
              )}
            />
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "..." : "Submit"}
              </Button>
            )}
          ></form.Subscribe>
        </form>
      </form.Provider>
    </>
  );
}
