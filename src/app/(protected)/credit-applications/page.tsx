"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreditDialog from "@/features/credit-application/components/CreditDialog";
import CreditApplicationList from "@/features/credit-application/components/CreditApplicationList";

const CreditPage = () => {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full justify-end">
        <Button onClick={() => setOpen(true)}>Crear solicitud</Button>

        <CreditDialog
          open={open}
          onOpenChange={setOpen}
          onSuccess={handleSuccess}
        />
      </div>

      <CreditApplicationList refreshKey={refreshKey} />
    </div>
  );
};

export default CreditPage;
