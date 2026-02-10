import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  if (user) {
    return <Redirect to="/" />;
  }

  // Login Form
  const loginForm = useForm({
    defaultValues: { email: "", password: "" },
  });

  const onLogin = (data: any) => login.mutate(data);

  // Register Form
  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { email: "", name: "", password: "" },
  });

  const onRegister = (data: any) => register.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-indigo-50 dark:from-gray-900 dark:to-gray-950">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2574&auto=format&fit=crop')] opacity-5 bg-cover bg-center pointer-events-none" />
      
      {/* Descriptive comment for Unsplash image above: Subtle romantic background pattern of love letters or soft texture */}

      <Card className="w-full max-w-md shadow-xl border-white/40 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
          </div>
          <CardTitle className="text-3xl font-serif">Us & We</CardTitle>
          <CardDescription className="text-base">
            Your shared space for tasks, goals, and love.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-2" disabled={login.isPending}>
                    {login.isPending ? "Logging in..." : "Log In"}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full hover-elevate"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Sign in with Google
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-2" disabled={register.isPending}>
                    {register.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-center text-xs text-muted-foreground pb-6">
          <p>Built with ❤️ for couples everywhere.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
