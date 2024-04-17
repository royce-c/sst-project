import { Button } from "@/components/ui/button";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});
function ProfilePage() {
  const { logout, user } = useKindeAuth();

  const [profilePicture, setProfilePicture] = useState<string | undefined>();
  const { getToken } = useKindeAuth();

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const token = await getToken();
      if (token) {
        headers["Authorization"] = token;
      }

      const res = await fetch(
        import.meta.env.VITE_APP_API_URL + "/profile-pictures",
        {
          method: "GET",
          headers,
        }
      );

      if (res.ok) {
        const { profilePictures } = await res.json();
        if (profilePictures.length > 0) {
          setProfilePicture(profilePictures[0].imageUrl);
        }
      }
    };

    fetchProfilePicture();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const token = await getToken();
    if (!token) return;

    const res = await fetch(
      import.meta.env.VITE_APP_API_URL + "/profile-picture",
      {
        method: "POST",
        headers: {
          Authorization: token,
        },
        body: formData,
      }
    );

    if (res.ok) {
      const { imageUrl } = await res.json();
      setProfilePicture(imageUrl);
    }
  };

  return (
    <div className="flex flex-col gap-y-4 items-center">
      <h1 className="text-4xl font-bold">Hi {user?.given_name}</h1>
      <div className="text-2xl font-bold">{user?.email}</div>
      {profilePicture && (
        <img
          className="rounded-full h-40 w-40 object-cover"
          src={profilePicture}
          alt="Profile"
        />
      )}
      <input type="file" accept="image/*" onChange={handleUpload} />
      <Button onClick={() => logout()}>Logout</Button>
    </div>
  );
}
