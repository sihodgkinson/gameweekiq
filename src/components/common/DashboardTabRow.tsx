"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DashboardTabOption {
  value: string;
  label: string;
}

interface DashboardTabRowProps {
  value: string;
  onValueChange: (value: string) => void;
  options: DashboardTabOption[];
  rightSlot?: React.ReactNode;
  touchMode?: boolean;
}

export function DashboardTabRow({
  value,
  onValueChange,
  options,
  rightSlot,
  touchMode = false,
}: DashboardTabRowProps) {
  return (
    <>
      <div className="flex w-full items-center gap-2 sm:hidden">
        <div className="min-w-0 flex-1">
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger
              size={touchMode ? "default" : "sm"}
              className={cn(
                "w-full",
                touchMode
                  ? "h-10 px-4 text-base data-[size=default]:h-10 data-[size=sm]:h-10"
                  : "h-8 text-sm"
              )}
            >
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {rightSlot}
      </div>

      <div className="hidden w-full items-center justify-between gap-3 sm:flex">
        <Tabs value={value} onValueChange={onValueChange}>
          <TabsList className={cn("h-8 p-[2px]", touchMode && "h-10 p-[3px]")}>
            {options.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                type="button"
                className={cn("px-3 sm:px-4", touchMode && "px-4 text-base")}
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {rightSlot}
      </div>
    </>
  );
}
