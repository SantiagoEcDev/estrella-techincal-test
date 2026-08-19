export type CreditApplicationStatus = "pending" | "approved" | "rejected";

export type CreditApplication = {
  id: string;
  userId: string;
  fullName: string;
  identityDocument: string;
  educationalInstitution: string;
  academicProgram: string;
  requestedAmount: number;
  videoUrl?: string | null;
  status: CreditApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateCreditApplicationPayload = {
  fullName: string;
  identityDocument: string;
  educationalInstitution: string;
  academicProgram: string;
  requestedAmount: number;
  videoUrl?: string;
};
export type UpdateCreditApplicationPayload = {
  identityDocument?: string;
  educationalInstitution?: string;
  academicProgram?: string;
  requestedAmount?: number;
  videoUrl?: string;
};
