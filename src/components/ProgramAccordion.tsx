'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { AdmissionFormData } from "@/schemas/admission-schema";
import { FieldErrors, UseFormGetValues, UseFormSetValue, UseFormWatch } from "react-hook-form";

export type ProgramNode = {
    id: number;
    name: string;
    children?: ProgramNode[];
};

interface ProgramAccordionProps {
    nodes: ProgramNode[];
    level?: number;
    setValue: UseFormSetValue<AdmissionFormData>;
    watch: UseFormWatch<AdmissionFormData>;
}

export default function ProgramAccordion({
    nodes,
    level = 0,
    setValue,
    watch,
}: ProgramAccordionProps) {
    const selected = watch("program");
    const handleProgramSelect = (node: ProgramNode) => {
        setValue("program", node.name)
        setValue("program_id", String(node.id))
    }

    return (
        <Accordion type="multiple" className={`pl-${level * 4}`}>
            {nodes.map((node, index) => {
                const id = `${level}-${index}-${node.name}`;
                // const hasChildren = node.children && node.children.length > 0;
                // const isSelected = selected === node.name //&& !hasChildren;

                return (
                    <AccordionItem key={id} value={id}>
                        <AccordionTrigger className="text-left">{node.name}</AccordionTrigger>
                        <AccordionContent>
                            <div
                                className={`pl-4 py-1 cursor-pointer rounded ${selected === node.name ? "bg-primary text-white" : "hover:bg-muted"
                                    }`}
                                onClick={() => handleProgramSelect(node)}
                            >
                                🎓 {node.name}
                            </div>

                            {Array.isArray(node.children) && node.children.length > 0 && (
                                <ProgramAccordion
                                    nodes={node.children}
                                    level={level + 1}
                                    setValue={setValue}
                                    watch={watch}
                                />
                            )}
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}

interface ProgramAccordionDisplayProps {
    programs: ProgramNode[],
    setValue: UseFormSetValue<AdmissionFormData>,
    watch: UseFormWatch<AdmissionFormData>,
    getValues: UseFormGetValues<AdmissionFormData>,
    errors: FieldErrors<AdmissionFormData>;
}
export const ProgramAccordionDisplay = ({ programs, setValue, getValues, watch, errors }: ProgramAccordionDisplayProps) => {

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-0 text-site-b-dark">Select a Program</h1>
            <p className="italic text-site-a-dark mb-4">any program can be selected from the parent to the child program...</p>

            <ProgramAccordion
                nodes={programs}
                setValue={setValue}
                watch={watch}
            />

            {errors.program && (
                <p className="text-red-500 text-sm mb-2">
                    {errors.program.message}
                </p>
            )}
            {errors.program_id && (
                <p className="text-red-500 text-sm">
                    {errors.program_id.message}
                </p>
            )}

            {getValues("program") && (
                <div className="mt-6 text-green-700 font-semibold border-t pt-4">
                    ✅ You selected: <span className="text-primary">{getValues("program")}</span>
                </div>
            )}
        </div>
    );
}

{/* <AccordionItem key={id} value={id}>
    <AccordionTrigger
        className={`text-left cursor-pointer rounded ${selected === node.name ? "bg-gray-200 " : "hover:bg-muted"
            }`}
        onClick={() => handleProgramSelect(node)}
    >
        {node.name}
    </AccordionTrigger>
    <AccordionContent>
        <div
            className={`pl-4 py-1 cursor-pointer rounded ${selected === node.name ? "bg-gray-100" : "hover:bg-muted"
                }`}
            onClick={() => handleProgramSelect(node)}
        >
            🎓 {node.name}
        </div>

        {Array.isArray(node.children) && node.children.length > 0 && (
            <ProgramAccordion
                nodes={node.children}
                level={level + 1}
                setValue={setValue}
                watch={watch}
            />
        )}
    </AccordionContent>
</AccordionItem> */}