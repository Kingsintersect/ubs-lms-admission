"use client";

import * as React from "react";
import { Controller, ControllerRenderProps, FieldValues } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormTextareaProps {
    control: any;
    name: string;
    label?: string;
    placeholder?: string;
    className?: string;
    rows?: number;
}

export function FormTextarea({
    control,
    name,
    label,
    placeholder,
    className,
    rows = 3,
}: FormTextareaProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {label && <Label htmlFor={name}>{label}</Label>}
            <Controller
                name={name}
                control={control}
                render={({ field }: { field: ControllerRenderProps<FieldValues> }) => (
                    <Textarea
                        id={name}
                        placeholder={placeholder}
                        rows={rows}
                        {...field}
                    />
                )}
            />
        </div>
    );
}