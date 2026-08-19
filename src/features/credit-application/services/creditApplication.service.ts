import { getAccessToken } from "@/features/authentication/services/authentication.service";
import {
  CreditApplication,
  CreateCreditApplicationPayload,
  UpdateCreditApplicationPayload,
} from "../types/creditApplication.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiResponse<T> = {
  data: T;
  message?: string;
};

const request = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Access token not found");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();

    throw new Error(error || `Request failed with status ${response.status}`);
  }

  return response.json();
};

export const createCreditApplication = async (
  data: CreateCreditApplicationPayload,
) => {
  const response = await request<ApiResponse<CreditApplication>>(
    "/credit-applications",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  return response.data;
};

export const getCreditApplications = async () => {
  const response = await request<ApiResponse<CreditApplication[]>>(
    "/credit-applications",
    {
      method: "GET",
    },
  );

  return response.data;
};

export const getCreditApplication = async (id: string) => {
  const response = await request<ApiResponse<CreditApplication>>(
    `/credit-applications/${id}`,
    {
      method: "GET",
    },
  );

  return response.data;
};

export const updateCreditApplication = async (
  id: string,
  data: UpdateCreditApplicationPayload,
) => {
  const response = await request<ApiResponse<CreditApplication>>(
    `/credit-applications/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );

  return response.data;
};

export const deleteCreditApplication = async (id: string) => {
  return request<ApiResponse<null>>(`/credit-applications/${id}`, {
    method: "DELETE",
  });
};
