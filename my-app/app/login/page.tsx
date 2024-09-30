"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { signIn, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error sending login link:", error);
      alert("Error sending login link. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-gray-900 dark:text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <motion.div
        className="w-full max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-64px-64px)]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full md:w-1/2 md:pl-8">
          <motion.h2
            className="mb-6 text-2xl font-bold text-gray-900 dark:text-white"
            variants={itemVariants}
          >
            Sign In to Your Account
          </motion.h2>
          {isSubmitted ? (
            <motion.div className="space-y-4 text-gray-700 dark:text-gray-300" variants={itemVariants}>
              <p className="text-green-600 dark:text-green-400">
                Magic link sent!
              </p>
              <p>
                Please check your email:{" "}
                <span className="font-semibold">{email}</span>
              </p>
              <p>Click the link in the email to log in.</p>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              variants={itemVariants}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <Button type="submit" className="w-full py-6">
                Send magic link
              </Button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
