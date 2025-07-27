import { Textarea } from "@/components/ui/textarea";
import { FormFieldProps } from "../constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";

export const FormField: React.FC<FormFieldProps> = ({
    name,
    control,
    errors,
    label,
    required = false,
    type = 'text',
    placeholder,
    options = [],
    rows = 3,
}) => {

    const renderField = (field: Record<string, unknown>) => {
        switch (type) {
            case 'textarea':
                return (
                    <Textarea
                        {...field}
                        value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
                        id={name}
                        placeholder={placeholder}
                        rows={rows}
                        className="mt-1"
                    />
                );
            case 'select':
                return (
                    <Select
                        onValueChange={field.onChange as (value: string) => void}
                        value={field.value as string | undefined ?? ""}
                    >
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'radio':
                return (
                    <RadioGroup
                        onValueChange={field.onChange as (value: string) => void}
                        value={field.value as string | undefined ?? ""}
                        className="mt-2">
                        {options.map(option => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value={option.value}
                                    id={option.value}
                                    disabled={option?.disabled}
                                />
                                <Label
                                    htmlFor={option.value}
                                    className={option?.disabled ? "text-muted-foreground" : ""}
                                >{option.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                );
            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={name}
                            checked={field.value as boolean | "indeterminate" | undefined}
                            onCheckedChange={field.onChange as ((checked: boolean | "indeterminate") => void)}
                        />
                        <Label htmlFor={name}>{label}</Label>
                    </div>
                );
            default:
                return (
                    <Input
                        {...field}
                        value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
                        id={name}
                        type={type}
                        placeholder={placeholder}
                        className="mt-1"
                    />
                );
        }
    };

    return (
        <div>
            {type !== 'checkbox' && (
                <Label htmlFor={name}>
                    {label} {required && <span className="text-pink-600">'*'</span>}
                </Label>
            )}
            <Controller
                name={name}
                control={control}
                render={({ field }) => renderField(field)}
            />
            {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
            )}
        </div>
    );
};