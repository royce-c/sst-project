import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Card className="w-fit mx-auto">
        <CardHeader>
          <CardTitle className="text-m">
            Welcome to the AI Image Upload App
          </CardTitle>
          <a href="/all-uploads" className="p-5 font-semibold all text-center">Click here to view your uploaded images</a>
        </CardHeader>
      </Card>
    </>
  );
}
