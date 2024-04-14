import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

// Define the login schema
const LoginSchema = z.object({
  identifier: z.string().min(3, { message: "Please enter email or username." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const requestBody = {
        ...data,
        username: data.identifier,
        email: data.identifier,
      };

      delete requestBody.identifier;

      const response = await axios.post("/api/v1/users/login", requestBody);
      if (response.status === 200) {
        // Handle successful login, e.g., redirect to home page
        console.log("User logged in Successfully!!!");
        navigate("/"); // Redirect to the home page
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`Error: ${error.response.data || "An error occurred"}`);
        // Display user-friendly error message based on the error code
        switch (error.response.status) {
          case 400:
            // Bad Request
            alert("Please fill in all required fields.");
            break;
          case 401:
            // Unauthorized
            alert("Invalid user credentials.");
            break;
          case 404:
            // doesnot exist
            alert("Invalid user credentials.");
            break;
          case 500:
            // Internal Server Error
            alert(
              "Something went wrong while logging in the user. Please try again later."
            );
            break;
          default:
            alert("An unexpected error occurred. Please try again.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received from the server.");
        alert(
          "No response received from the server. Please check your internet connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up the request.");
        alert("Error setting up the request. Please try again.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-6 xl:w-1/4 md:w-1/2 shadow-md bg-">
        <div className="w-full flex flex-col gap-y-3 items-center justify-center mb-8">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-muted-foreground text-sm">Access your account</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Email or Username
            </label>
            <Input
              autoComplete="username"
              placeholder="johndoe"
              {...register("identifier")}
              className="mt-1 block w-full py-2 px-3 border sm:text-sm"
            />
            {errors.identifier && (
              <p className="mt-2 text-sm text-red-600">
                {errors.identifier.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <Input
              autoComplete="current-password"
              placeholder="********"
              type="password"
              {...register("password")}
              className="mt-1 block w-full py-2 px-3 border sm:text-sm"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <div className="text-center mt-6">
          <Link to={"/register"}>
            <Button variant="link" className="font-normal w-full" size="sm">
              Don't have an account? Register here
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
