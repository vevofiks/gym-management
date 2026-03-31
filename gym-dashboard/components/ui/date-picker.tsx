"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  side?: "top" | "bottom" | "left" | "right"
  date?: Date
  setDate: (date?: Date) => void
  label?: string
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
  disableFutureDates?: boolean
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
  startMonth?: Date
  endMonth?: Date
}

export function DatePicker({
  side,
  date,
  setDate,
  label,
  placeholder = "Pick a date",
  required,
  error,
  disabled,
  disableFutureDates,
  captionLayout = "label",
  startMonth,
  endMonth,
}: DatePickerProps) {
  return (
    <Field className="w-full">
      {label && (
        <FieldLabel>
          {label} {required && <span className="text-red-500">*</span>}
        </FieldLabel>
      )}
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-10 px-4 rounded-xl border-border bg-background hover:bg-muted transition-all",
              !date && "text-muted-foreground",
              error && "border-red-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {date ? format(date, "dd-MM-yyyy") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 z-9999"
          align="start"
          side={side}
          sideOffset={8}
          avoidCollisions={false}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={disableFutureDates ? { after: new Date() } : undefined}
            captionLayout={captionLayout}
            startMonth={startMonth}
            endMonth={endMonth}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-[10px] mt-1 font-bold">{error}</p>}
    </Field>
  )
}
