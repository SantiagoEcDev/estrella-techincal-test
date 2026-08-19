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
};

const CreditDialog = ({ open, onOpenChange }: CreditDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Solicitud de Crédito</DialogTitle>
        </DialogHeader>

        <CreditApplicationForm />
      </DialogContent>
    </Dialog>
  );
};

export default CreditDialog;
