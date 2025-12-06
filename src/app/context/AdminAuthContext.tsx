"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { Plan } from "../lib/types/plan";
import { Admin } from "../lib/types/admin";

interface AdminAuthContextType {
  admin: Admin | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  addPlan: (planData: Omit<Plan, "id" | "createdAt">) => Promise<void>;
  plans: Plan[];
  fetchPlans: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);

  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await fetch("/api/admin/auth/session");
        const data = await response.json();
        if (data.admin) {
          setAdmin(data.admin);
        }
      } catch (error) {
        console.log("Failed To Fetch Session", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Failed To Login Into Admin Account Kindly Try Again...");
    }

    const adminData = await response.json();
    setAdmin(adminData);
    router.push("/admin/dashboard");
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: string,
  ) => {
    const response = await fetch("/api/admin/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    });

    if (!response) {
      throw new Error(
        "Registration Failed To Admin Account Kindly Try Again...",
      );
    }

    const adminData = await response.json();
    setAdmin(adminData);
    router.push("/admin/dashboard");
  };

  const logout = async () => {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
    });
    setAdmin(null);
    router.replace("/");
  };

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/plans", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
    }
  }, []);

  useEffect(() => {
    if (admin) {
      fetchPlans();
    }
  }, [admin, fetchPlans]);

  const addPlan = async (planData: Omit<Plan, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed To Add New Plan");
      await fetchPlans();
    } catch (error) {
      console.error("Failed to add plan:", error);
      throw error;
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        login,
        register,
        logout,
        isLoading,
        isAdminAuthenticated: !!admin,
        plans,
        fetchPlans,
        addPlan,
      }}
    >
      {" "}
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AuthProvider");
  }
  return context;
}