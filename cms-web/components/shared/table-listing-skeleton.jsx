"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export const TableListingSkeleton = ({ listingLength, columnLength }) => {
  return Array.from({ length: listingLength }).map((_, rowIndex) => (
    <TableRow key={rowIndex}>
      {Array.from({ length: columnLength }).map((_, colIndex) => (
        <TableCell key={colIndex} className="px-4 py-2">
          <Skeleton className="w-20 h-5" />
        </TableCell>
      ))}
    </TableRow>
  ));
};

