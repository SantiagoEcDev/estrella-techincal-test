"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreditApplicationForm from "./CreateCreditForm";

type CreditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const CreditDialog = ({ open, onOpenChange, onSuccess }: CreditDialogProps) => {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Solicitud de Crédito</DialogTitle>
        </DialogHeader>

        <CreditApplicationForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default CreditDialog;
