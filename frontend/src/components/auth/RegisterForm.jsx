import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

const formSchema = z
  .object({
    fullName: z.string().min(2, {
      message: "Please enter your name",
    }),
    homeTown: z.string().min(3, {
      message: "Please enter your Hometown",
    }),
    email: z.string().email("Invalid email address."),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(1, {
      message: "Please confirm password",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const RegisterForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("/api/v1/users/register", data);
      if (response.status === 201) {
        // Handle successful registration, e.g., redirect to home page
        console.log("User registered Successfully!!!");
        navigate("/login"); // Use navigate to redirect to the home page
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx


        console.error(
          `Error: ${error.response.data || "An error occurred"}`
        );
        // Display user-friendly error message based on the error code
        switch (error.response.status) {
          case 400:
            // Bad Request
            alert("Please fill in all required fields.");
            break;
          case 409:
            // Conflict
            alert("User with email or username already exists!");
            break;
          case 500:
            // Internal Server Error
            alert(
              "Something went wrong while registering the user. Please try again later."
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
          <h1 className="text-2xl font-bold">Register</h1>
          <p className="text-muted-foreground text-sm">Create your account</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Name
              <Input
                placeholder="John Doe"
                {...register("fullName")}
                className="mt-1 block w-full py-2 px-3 border sm:text-sm"
              />
            </label>
            {errors.fullName && (
              <p className="mt-2 text-sm text-red-600">
                {errors.fullName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Hometown
              <Input
                placeholder="Guwahati"
                {...register("homeTown")}
                className="mt-1 block w-full py-2 px-3 border sm:text-sm"
              />
            </label>
            {errors.homeTown && (
              <p className="mt-2 text-sm text-red-600">
                {errors.homeTown.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Email
              <Input
                autoComplete="new-password"
                placeholder="johndoe@email.com"
                {...register("email")}
                className="mt-1 block w-full py-2 px-3 border sm:text-sm"
              />
            </label>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Password
              <Input
                autoComplete="new-password"
                placeholder="********"
                type="password"
                {...register("password")}
                className="mt-1 block w-full py-2 px-3 border sm:text-sm"
              />
            </label>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Confirm Password
              <Input
                autoComplete="new-password"
                placeholder="********"
                type="password"
                {...register("confirmPassword")}
                className="mt-1 block w-full py-2 px-3 border sm:text-sm"
              />
            </label>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
        <div className="text-center mt-6">
          <Link to={"/login"}>
            <Button variant="link" className="font-normal w-full" size="sm">
              Don't have an account? Login here
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterForm;
