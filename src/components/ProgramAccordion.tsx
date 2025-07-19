'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { AdmissionFormData } from "@/schemas/admission-schema";
import { FieldErrors, UseFormGetValues, UseFormSetValue, UseFormWatch } from "react-hook-form";

type ProgramNode = {
    name: string;
    children?: ProgramNode[];
};

interface ProgramAccordionProps {
    nodes: ProgramNode[];
    level?: number;
    setValue: UseFormSetValue<AdmissionFormData>;
    watch: UseFormWatch<AdmissionFormData>;
    // onSelect: (value: string) => void;
    // selected: string | null;
}

export default function ProgramAccordion({
    nodes,
    level = 0,
    setValue,
    watch,
    // onSelect,
    // selected,
}: ProgramAccordionProps) {
    const selected = watch("program");

    return (
        <Accordion type="multiple" className={`pl-${level * 4}`}>
            {nodes.map((node, index) => {
                const id = `${level}-${index}-${node.name}`;
                const hasChildren = node.children && node.children.length > 0;
                const isSelected = selected === node.name && !hasChildren;

                return (
                    <AccordionItem key={id} value={id}>
                        <AccordionTrigger className="text-left">{node.name}</AccordionTrigger>
                        <AccordionContent>
                            {hasChildren ? (
                                <ProgramAccordion
                                    nodes={node.children!}
                                    level={level + 1}
                                    setValue={setValue}
                                    watch={watch}
                                // onSelect={onSelect}
                                // selected={selected}
                                />
                            ) : (
                                <div
                                    className={`pl-4 py-1 cursor-pointer rounded ${isSelected ? "bg-primary text-white" : "hover:bg-muted"}`}
                                    // onClick={() => onSelect(node.name)}
                                    onClick={() => setValue("program", node.name)}
                                >
                                    🎓 {node.name}
                                </div>
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
    // const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-site-a-dark">Select a Program</h1>

            <ProgramAccordion
                nodes={programs}
                setValue={setValue}
                watch={watch}
            // onSelect={setSelectedProgram}
            // selected={selectedProgram}
            />

            {errors.program && (
                <p className="text-red-500 text-sm">
                    {errors.program.message}
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
