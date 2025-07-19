'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

type ProgramNode = {
    name: string;
    children?: ProgramNode[];
};

interface ProgramAccordionProps {
    nodes: ProgramNode[];
    level?: number;
    onSelect: (value: string) => void;
    selected: string | null;
}

export default function ProgramAccordion({
    nodes,
    level = 0,
    onSelect,
    selected,
}: ProgramAccordionProps) {
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
                                    onSelect={onSelect}
                                    selected={selected}
                                />
                            ) : (
                                <div
                                    className={`pl-4 py-1 cursor-pointer rounded ${isSelected ? "bg-primary text-white" : "hover:bg-muted"
                                        }`}
                                    onClick={() => onSelect(node.name)}
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
