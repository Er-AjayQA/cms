"use client";

import { TableCell, TableRow } from "./ui/table";

export const TableListingNoRecords = ({ span }) => {
  return (
    <TableRow>
      <TableCell colSpan={span} className="py-6 text-center">
        No Data Found
      </TableCell>
    </TableRow>
  );
};
