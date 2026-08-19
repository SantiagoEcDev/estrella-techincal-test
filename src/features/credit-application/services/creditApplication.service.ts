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

type ApiCreditApplication = {
  id: string;
  user_id: string;
  full_name: string;
  identity_document: string;
  educational_institution: string;
  academic_program: string;
  requested_amount: string;
  video_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
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

const mapCreditApplication = (
  application: ApiCreditApplication,
): CreditApplication => ({
  id: application.id,
  userId: application.user_id,
  fullName: application.full_name,
  identityDocument: application.identity_document,
  educationalInstitution: application.educational_institution,
  academicProgram: application.academic_program,
  requestedAmount: Number(application.requested_amount),
  videoUrl: application.video_url,
  status: application.status,
  createdAt: application.created_at,
  updatedAt: application.updated_at,
});

export const createCreditApplication = async (
  data: CreateCreditApplicationPayload,
) => {
  const response = await request<ApiResponse<ApiCreditApplication>>(
    "/credit-applications",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  return mapCreditApplication(response.data);
};

export const getCreditApplications = async () => {
  const response = await request<ApiResponse<ApiCreditApplication[]>>(
    "/credit-applications",
    {
      method: "GET",
    },
  );

  return response.data.map(mapCreditApplication);
};

export const getCreditApplication = async (id: string) => {
  const response = await request<ApiResponse<ApiCreditApplication>>(
    `/credit-applications/${id}`,
    {
      method: "GET",
    },
  );

  return mapCreditApplication(response.data);
};

export const updateCreditApplication = async (
  id: string,
  data: UpdateCreditApplicationPayload,
) => {
  const response = await request<ApiResponse<ApiCreditApplication>>(
    `/credit-applications/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );

  return mapCreditApplication(response.data);
};

export const deleteCreditApplication = async (id: string) => {
  return request<ApiResponse<null>>(`/credit-applications/${id}`, {
    method: "DELETE",
  });
};
