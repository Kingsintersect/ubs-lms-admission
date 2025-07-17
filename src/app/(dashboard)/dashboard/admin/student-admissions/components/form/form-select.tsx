"use client";

import * as React from "react";
import { Controller, ControllerRenderProps, FieldValues } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormSelectProps {
    control: any;
    name: string;
    label?: string;
    placeholder?: string;
    options: { value: string; label: string }[];
    className?: string;
}

export function FormSelect({
    control,
    name,
    label,
    placeholder,
    options,
    className,
}: FormSelectProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {label && <Label htmlFor={name}>{label}</Label>}
            <Controller
                name={name}
                control={control}
                render={({ field }: { field: ControllerRenderProps<FieldValues> }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
        </div>
    );
}