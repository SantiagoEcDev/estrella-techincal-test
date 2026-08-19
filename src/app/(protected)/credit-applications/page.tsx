"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreditDialog from "@/features/credit-application/components/CreditDialog";

const CreditPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full justify-end">
      <Button onClick={() => setOpen(true)}>Crear solicitud</Button>

      <CreditDialog open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default CreditPage;
