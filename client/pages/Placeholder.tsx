import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="grid place-items-center min-h-[50vh]">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-4">
          This section is ready to be filled with your requirements. Ask to generate this page next and we'll implement it.
        </p>
        <Button asChild>
          <Link to="/tests">Go to Tests</Link>
        </Button>
      </div>
    </div>
  );
}
