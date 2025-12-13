"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { TableSkeleton } from "./loading-skeleton"

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  onDelete?: (item: T) => void
  keyExtractor: (item: T) => string | number
}

export function DataTable<T>({ data, columns, loading, onDelete, keyExtractor }: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton rows={5} />
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((col) => (
              <TableHead key={String(col.key)} className="font-semibold">
                {col.label}
              </TableHead>
            ))}
            {onDelete && <TableHead className="w-20">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (onDelete ? 1 : 0)}
                className="text-center py-8 text-muted-foreground"
              >
                Aucune donnée disponible
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <motion.tr
                key={keyExtractor(item)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key as string] ?? "-")}
                  </TableCell>
                ))}
                {onDelete && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
