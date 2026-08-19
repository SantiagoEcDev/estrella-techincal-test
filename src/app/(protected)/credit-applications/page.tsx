"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreditDialog from "@/features/credit-application/components/CreditDialog";
import CreditApplicationList from "@/features/credit-application/components/CreditApplicationList";

const CreditPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex w-full justify-end">
        <Button onClick={() => setOpen(true)}>Crear solicitud</Button>

        <CreditDialog open={open} onOpenChange={setOpen} />
      </div>
      <CreditApplicationList />
    </>
  );
};

export default CreditPage;
