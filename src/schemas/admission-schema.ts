import { StudentType } from "@/config/Types";
import z from "zod";


// Max file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Zod validation schema
export const admissionSchema = z.object({
    id: z.string().optional(),

    // Personal Information
    lga: z.string().min(1, 'Local Gov. Area is required'),
    religion: z.string().min(2, 'Religion is required'),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
    hometown: z.string().min(2, 'Home town is required'),
    hometown_address: z.string().min(2, 'Home town address is required'),
    contact_address: z.string().min(2, 'Contact address is required'),

    // Sponsors Information
    has_sponsor: z.boolean().default(false),//to be changed to has_sponsor
    sponsor_name: z.string().optional(),
    sponsor_relationship: z.string().optional(),
    sponsor_email: z.string().email('Invalid email address').optional(),
    sponsor_contact_address: z.string().optional(),
    sponsor_phone_number: z.string().optional(),

    // next of kin
    next_of_kin_name: z.string().min(1, "Full name is required"),
    next_of_kin_relationship: z.string().min(1, "Relationship is required"),
    next_of_kin_phone_number: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number is too long"),
    next_of_kin_address: z.string().min(1, "Address is required"),
    next_of_kin_email: z.string().email("").optional(),
    is_next_of_kin_primary_contact: z.boolean().default(false).optional(),
    next_of_kin_alternate_phone_number: z
        .string()
        .min(10, "")
        .max(15, "")
        .optional(),
    next_of_kin_occupation: z.string().optional(),
    next_of_kin_workplace: z.string().optional(),

    // Sponsors Information
    primary_school_leaving: z.instanceof(File).optional(),//to be changed to has_sponsor
    o_level: z.instanceof(File).optional(),
    degree: z.instanceof(File).optional(),
    hnd: z.instanceof(File).optional(),
    ond: z.instanceof(File).optional(),
    transcript: z.instanceof(File).optional(),
    others: z
        .array(z.instanceof(File))
        .optional()
        .refine((files) => files ? files.every(file => file.size <= MAX_FILE_SIZE) : true, "Each image must be ≤ 5MB")
        .refine((files) => files ? files.every(file => ACCEPTED_IMAGE_TYPES.includes(file.type)) : true, "Unsupported image type"),

    // Academic Information
    undergraduateDegree: z.string().min(1, 'Undergraduate degree is required'),
    university: z.string().min(2, 'University name is required'),
    gpa: z.string().refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 4.0;
    }, 'GPA must be between 0.0 and 4.0'),
    graduationYear: z.string().min(4, 'Graduation year is required'),

    // Test Scores
    gmatScore: z.string().optional(),
    greScore: z.string().optional(),
    toeflScore: z.string().optional(),

    // Professional Experience
    workExperience: z.string().optional(),
    currentPosition: z.string().optional(),
    company: z.string().optional(),
    yearsOfExperience: z.string().optional(),

    // Program Selection
    // program: z.string().min(1, 'Program selection is required'),
    // program_id: z.string().min(1, 'Program selection is required'),
    startTerm: z.string().min(1, 'Start term is required'),
    studyMode: z.string().min(1, 'Study mode is required'),

    // Essays
    personalStatement: z
        .string()
        .min(100, 'Personal statement must be at least 100 characters')
        .max(255, "Personal statement must be under 255 characters")
        .nonempty("Personal statement is required"),
    careerGoals: z
        .string()
        .min(100, 'Career goals must be at least 100 characters')
        .max(150, "Career goals must be under 150 characters")
        .nonempty("Career goals is required"),

    // Additional Information
    disability: z.boolean().default(false),
    requiresVisa: z.boolean().default(false),
    agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to terms and conditions'),

    // Academic Images
    images: z
        .array(z.instanceof(File))
        .optional()
        // .default([]) // ensures it's always defined as an array
        .refine((files) => files ? files.every(file => file.size <= MAX_FILE_SIZE) : true, "Each image must be ≤ 5MB")
        .refine((files) => files ? files.every(file => ACCEPTED_IMAGE_TYPES.includes(file.type)) : true, "Unsupported image type"),

    // Profile Picture
    passportPhoto: z.instanceof(File).optional(),

    passport: z.string().optional(),
    awaiting_result: z.boolean().default(true),
}).superRefine((data, ctx) => {
    validateSponsorFields(data, ctx);
});
type SponsorCheck = {
    key: keyof AdmissionFormData;
    value: string | undefined;
    message: string;
    minLength?: number;
    validate?: () => boolean;
};

function validateSponsorFields(data: AdmissionFormData, ctx: z.RefinementCtx) {
    if (data.has_sponsor) {
        const checks: SponsorCheck[] = [
            {
                key: "sponsor_name",
                value: data.sponsor_name,
                minLength: 2,
                message: "Sponsor's name is required",
            },
            {
                key: "sponsor_relationship",
                value: data.sponsor_relationship,
                minLength: 2,
                message: "Sponsor's relationship is required",
            },
            {
                key: "sponsor_email",
                value: data.sponsor_email,
                message: "Sponsor's email is required",
                validate: () => !!data.sponsor_email && /\S+@\S+\.\S+/.test(data.sponsor_email),
            },
            {
                key: "sponsor_contact_address",
                value: data.sponsor_contact_address,
                minLength: 10,
                message: "Sponsor's contact address is required",
            },
            {
                key: "sponsor_phone_number",
                value: data.sponsor_phone_number,
                minLength: 10,
                message: "Sponsor's phone number is required",
            },
        ];

        for (const { key, value, message, minLength = 1, validate } of checks) {
            const isValid =
                typeof validate === "function"
                    ? validate()
                    : value && value.trim().length >= minLength;

            if (!isValid) {
                ctx.addIssue({
                    path: [key],
                    code: z.ZodIssueCode.custom,
                    message,
                });
            }
        }
    }
}


export type AdmissionFormData = z.infer<typeof admissionSchema>;
export interface ApplicationDetailsType extends StudentType {
    application: AdmissionFormData;
}
