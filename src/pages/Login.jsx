import { useState } from "react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-extrabold mb-2 text-green-800">
            Welcome back, Chef
          </h2>
          <p className="mb-5 text-gray-700">Sign in to start cooking smarter.</p>
          {/* Email Field */}
          <div className="mb-4">
            <label 
              htmlFor="email" 
              className="block text-lg font-semibold mb-1 text-gray-900"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              autoComplete="email"
            />
          </div>
          {/* Password Field */}
          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block text-lg font-semibold mb-1 text-gray-900"
            >
              Password
            </label>
            <div className="flex">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="flex-1 rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="ml-2 bg-black text-green-400 px-6 rounded-lg font-semibold text-lg"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {/* Login Button */}
          <button
            type="submit"
            className="w-full font-semibold text-lg text-white rounded-lg py-2 bg-gradient-to-r from-green-600 to-lime-500 shadow transition hover:shadow-md"
          >
            Login
          </button>
          <p className="mt-6 text-gray-600 text-center">
            Tip: Try saving your favorite ingredients on the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
