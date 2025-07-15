import { AdmissionFormData } from "@/schemas/admission-schema";
import { Briefcase, FileText, GraduationCap, Users, User } from "lucide-react";
import { Control, FieldErrors } from "react-hook-form";

export interface Step {
    title: string;
    icon: React.ElementType;
    fields: (keyof AdmissionFormData)[];
}

export interface FormFieldProps {
    name: keyof AdmissionFormData;
    control: Control<AdmissionFormData>;
    errors: FieldErrors<AdmissionFormData>;
    label: string;
    required?: boolean;
    type?: 'text' | 'email' | 'date' | 'textarea' | 'select' | 'radio' | 'checkbox';
    placeholder?: string;
    options?: { value: string; label: string, disabled?: boolean }[];
    rows?: number;
}
export const STEPS: Step[] = [
    {
        title: 'Personal Information',
        icon: User,
        fields: ['lga', 'religion', 'dob', 'gender', 'hometown', 'hometown_address', 'contact_address']
    },
    {
        title: `Sponsor's Information`,
        icon: Users,
        fields: ['sponsor_name', 'sponsor_relationship', 'sponsor_email', 'sponsor_contact_address', 'sponsor_phone_number']
    },
    {
        title: 'Academic Background',
        icon: GraduationCap,
        fields: ['undergraduateDegree', 'university', 'gpa', 'graduationYear', 'images']
    },
    {
        title: 'Professional Experience (Optional)',
        icon: Briefcase,
        fields: ['workExperience', 'currentPosition', 'company', 'yearsOfExperience']
    },
    {
        title: 'Program & Essays',
        icon: FileText,
        fields: ['program', 'startTerm', 'studyMode', 'personalStatement', 'careerGoals', 'agreeToTerms']
    },
];

export const GENDER = [
    { value: 'MALE', label: 'MALE' },
    { value: 'FEMALE', label: 'FEMALE' },
];

export const LocalGovArea = [
    { value: 'awka', label: 'Awka' },
    { value: 'enugu', label: 'Enugu' },
    { value: 'onitsha', label: 'Onitsha' },
    { value: 'nnewi', label: 'Nnewi' },
    { value: 'okigwe', label: 'Okigwe' },
    { value: 'umudike', label: 'Umudike' },
    { value: 'awka_ibu', label: 'Awka Ibu' },
    { value: 'awka_south', label: 'Awka South' },
    { value: 'awka_north', label: 'Awka North' },
    { value: 'awka_east', label: 'Awka East' },
    { value: 'awka_west', label: 'Awka West' },
];

export const RELIGION = [
    { value: 'christianity', label: 'Christianity' },
    { value: 'islam', label: 'Islam' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'other', label: 'Other' },
]
export const NATIONALITIES = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'cn', label: 'China' },
    { value: 'in', label: 'India' },
    { value: 'other', label: 'Other' },
];

export const PROGRAMS = [
    { value: 'mba', label: 'MBA' },
    { value: 'executive-mba', label: 'Executive MBA' },
    { value: 'msc-finance', label: 'MSc Finance' },
    { value: 'msc-marketing', label: 'MSc Marketing' },
    { value: 'msc-management', label: 'MSc Management' },
];

export const START_TERMS = [
    { value: '2024/2025', label: '2024 / 2025' },
    { value: '20225/2025', label: '2025 / 2025' },
    { value: '2026/2027', label: '2026 / 2027' },
];

export const YEARS_OF_EXPERIENCE = [
    { value: '0-1', label: '0-1 years' },
    { value: '2-3', label: '2-3 years' },
    { value: '4-5', label: '4-5 years' },
    { value: '6-10', label: '6-10 years' },
    { value: '10+', label: '10+ years' },
];

export const STUDY_MODES = [
    { value: 'full-time', label: 'Full-time', disabled: true },
    { value: 'part-time', label: 'Part-time', disabled: true },
    { value: 'online', label: 'Online' },
];