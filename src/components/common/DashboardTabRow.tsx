"use client";

import * as React from "react";
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
}

export function DashboardTabRow({
  value,
  onValueChange,
  options,
  rightSlot,
}: DashboardTabRowProps) {
  return (
    <>
      <div className="flex w-full items-center gap-2 sm:hidden">
        <div className="min-w-0 flex-1">
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-8 w-full text-sm">
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
          <TabsList className="h-8 p-[2px]">
            {options.map((option) => (
              <TabsTrigger key={option.value} value={option.value} type="button" className="px-3 sm:px-4">
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
