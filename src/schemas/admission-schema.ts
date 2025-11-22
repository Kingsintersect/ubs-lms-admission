import { ProgramType } from '@/config';
import { UserInterface } from '@/config/Types';
import { z } from 'zod';

// Common constants
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// File validation utility
const fileSchema = z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    .refine(file => ACCEPTED_FILE_TYPES.includes(file.type),
        "Unsupported file type. Only images and documents (PDF, DOC, DOCX) are allowed"
    );

// Common Base Schema (Shared by both programs)
const baseApplicationSchema = z.object({
    // Personal Information (Common)
    // id: z.string().optional(),
    id: z.union([z.string(), z.number()]).optional().transform(val =>
        val !== undefined ? String(val) : undefined
    ),
    lga: z.string().min(1, 'Local Gov. Area is required').default(''),
    religion: z.string().min(2, 'Religion is required').default(''),
    dob: z.string().min(1, 'Date of birth is required').default(''),
    gender: z.string().min(1, 'Gender is required').default(''),
    hometown: z.string().min(2, 'Home town is required').default(''),
    hometown_address: z.string().min(2, 'Home town address is required').default(''),
    contact_address: z.string().min(2, 'Contact address is required').default(''),

    // Sponsor Information (Common)
    has_sponsor: z.boolean().default(false),
    sponsor_name: z.string().optional(),
    sponsor_relationship: z.string().optional(),
    sponsor_email: z.string().email('Invalid email address').optional(),
    sponsor_contact_address: z.string().optional(),
    sponsor_phone_number: z.string().optional(),

    // Next of Kin (Common)
    next_of_kin_name: z.string().min(1, "Full name is required").default(''),
    next_of_kin_relationship: z.string().min(1, "Relationship is required").default(''),
    next_of_kin_phone_number: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long").default(''),
    next_of_kin_address: z.string().min(1, "Address is required").default(''),
    next_of_kin_email: z.string().email().optional(),
    is_next_of_kin_primary_contact: z.boolean().default(false).optional(),
    next_of_kin_alternate_phone_number: z.string().min(10).max(15).optional(),
    next_of_kin_occupation: z.string().optional(),
    next_of_kin_workplace: z.string().optional(),


    // Documents (Common)
    first_school_leaving: fileSchema.optional(),
    o_level: fileSchema.optional(),
    passport: fileSchema.optional(),
    other_documents: z.array(fileSchema).optional(),

    // Additional Information (Common)
    has_disability: z.boolean().default(false),
    disability: z.string().optional().default("None"),
    agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to terms and conditions'),
});

// Business School Specific Schema
export const businessSchoolSchema = baseApplicationSchema.extend({
    programType: z.literal("business_school"),
    awaiting_result: z.boolean().default(true),

    // Academic Information (Business-specific)
    undergraduateDegree: z.string().min(1, 'Undergraduate degree is required').default(''),
    university: z.string().min(2, 'University name is required').default(''),
    gpa: z.string()
        .optional()
        .refine(val => {
            if (!val) return true;
            const num = parseFloat(val);
            return !isNaN(num) && num >= 0 && num <= 5.0;
        }, 'GPA must be between 0.0 and 5.0').default(''),
    graduationYear: z.string().min(4, 'Graduation year is required').default(''),

    // Test Scores (Business-specific)
    gmatScore: z.string().optional(),
    greScore: z.string().optional(),
    toeflScore: z.string().optional(),

    // Professional Experience (Business-specific)
    workExperience: z.string().optional(),
    currentPosition: z.string().optional(),
    company: z.string().optional(),
    yearsOfExperience: z.string().optional(),

    // Essays (Business-specific)
    personalStatement: z.string()
        .min(100, 'Personal statement must be at least 100 characters')
        .max(255, "Personal statement must be under 255 characters").default(''),
    careerGoals: z.string()
        .min(100, 'Career goals must be at least 100 characters')
        .max(250, "Career goals must be under 250 characters").default(''),

    // Business-specific documents
    hnd: fileSchema.optional(),
    degree: fileSchema.optional(),
    degree_transcript: fileSchema.optional(),

    // Program Selection
    startTerm: z.string().min(1, 'Start term is required').default(''),
    studyMode: z.string().min(1, 'Study mode is required').default('online'),
});

// Update your odlProgramSchema
export const odlProgramSchema = baseApplicationSchema.extend({
    programType: z.literal("odl"),

    // Degree-specific fields
    combined_result: z.union([
        z.literal('single_result'),
        z.literal('combined_result'),
        z.literal(''),
    ]).optional().default(''),
    awaiting_result: z.boolean().default(false),

    // Exam Sitting (Degree-specific) - make these optional
    first_sitting_type: z.string().optional(),
    first_sitting_year: z.string().optional(),
    first_sitting_exam_number: z.string().optional(),
    second_sitting_type: z.string().optional(),
    second_sitting_year: z.string().optional(),
    second_sitting_exam_number: z.string().optional(),

    // Degree-specific document fields
    first_sitting_result: fileSchema.optional(),
    second_sitting_result: fileSchema.optional(),
    first_sitting: z.any().optional(),
    second_sitting: z.any().optional(),

    // Program Selection
    startTerm: z.string().min(1, 'Start term is required').default(''),
    studyMode: z.string().min(1, 'Study mode is required').default('online'),
});

// Combined Schema with Refinement
export const applicationSchema = z.discriminatedUnion("programType", [
    businessSchoolSchema,
    odlProgramSchema,
]).superRefine((data, ctx) => {
    // Common validation logic for both programs
    validateSponsorFields(data, ctx);
    validateDisabilityFields(data, ctx);

    // Program-specific validations - ONLY validate required fields for the current program type
    if (data.programType === ProgramType.BUSINESS_SCHOOL) {
        validateBusinessSchoolFields(data, ctx);
    } else if (data.programType === ProgramType.ODL) {
        validateDegreeSittingFields(data, ctx);
    }
});

// Validation functions
function validateSponsorFields(data: BusinessApplication | ODLApplication, ctx: z.RefinementCtx) {
    if (data.has_sponsor) {
        const checks = [
            { field: data.sponsor_name, path: ['sponsor_name'], message: "Sponsor's name is required" },
            { field: data.sponsor_relationship, path: ['sponsor_relationship'], message: "Sponsor's relationship is required" },
            { field: data.sponsor_contact_address, path: ['sponsor_contact_address'], message: "Sponsor's contact address is required", minLength: 10 },
            { field: data.sponsor_phone_number, path: ['sponsor_phone_number'], message: "Sponsor's phone number is required", minLength: 10 },
        ];

        checks.forEach(({ field, path, message, minLength = 1 }) => {
            if (!field || field.trim().length < minLength) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
            }
        });

        // Validate sponsor email separately
        if (!data.sponsor_email || !/\S+@\S+\.\S+/.test(data.sponsor_email)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['sponsor_email'],
                message: "Valid sponsor email is required",
            });
        }
    }
}

function validateDisabilityFields(data: BusinessApplication | ODLApplication, ctx: z.RefinementCtx) {
    if (data.has_disability && (!data.disability || data.disability.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['disability'],
            message: "Please describe your disability",
        });
    }
}

// Add this new validation function
function validateBusinessSchoolFields(data: BusinessApplication, ctx: z.RefinementCtx) {
    // Only validate Business School required fields
    const businessChecks = [
        { field: data.undergraduateDegree, path: ['undergraduateDegree'], message: 'Undergraduate degree is required' },
        { field: data.university, path: ['university'], message: 'University name is required' },
        { field: data.graduationYear, path: ['graduationYear'], message: 'Graduation year is required' },
        // { field: data.startTerm, path: ['startTerm'], message: 'Start term is required' },
        // { field: data.studyMode, path: ['studyMode'], message: 'Study mode is required' },
        { field: data.personalStatement, path: ['personalStatement'], message: 'Personal statement is required' },
        { field: data.careerGoals, path: ['careerGoals'], message: 'Career goals are required' },
    ];

    businessChecks.forEach(({ field, path, message }) => {
        if (!field || field.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
        }
    });

    // Validate essay lengths
    if (data.personalStatement && data.personalStatement.length < 100) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['personalStatement'],
            message: 'Personal statement must be at least 100 characters',
        });
    }

    if (data.careerGoals && data.careerGoals.length < 100) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['careerGoals'],
            message: 'Career goals must be at least 100 characters',
        });
    }
}

function validateDegreeSittingFields(data: ODLApplication, ctx: z.RefinementCtx) {
    if (!data.awaiting_result) {
        // combined_result is required when not awaiting
        if (!data.combined_result || data.combined_result.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['combined_result'],
                message: "Please select result type",
            });
        }

        // First sitting fields are always required when not awaiting
        const firstSittingChecks = [
            { field: data.first_sitting_type, path: ['first_sitting_type'], message: "First sitting exam type is required" },
            { field: data.first_sitting_year, path: ['first_sitting_year'], message: "First sitting exam year is required" },
            { field: data.first_sitting_exam_number, path: ['first_sitting_exam_number'], message: "First sitting exam number is required" },
            { field: data.first_sitting_result, path: ['first_sitting_result'], message: "First sitting result file is required" },
        ];

        firstSittingChecks.forEach(({ field, path, message }) => {
            // Differentiate validation for strings and files
            if (typeof field === 'string') {
                if (!field || field.trim() === '') {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
                }
            } else if (!field) { // For File objects or other types
                ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
            }
        });

        // Second sitting fields are required only for combined results
        if (data.combined_result === 'combined_result') {
            const secondSittingChecks = [
                { field: data.second_sitting_type, path: ['second_sitting_type'], message: "Second sitting exam type is required for combined results" },
                { field: data.second_sitting_year, path: ['second_sitting_year'], message: "Second sitting exam year is required for combined results" },
                { field: data.second_sitting_exam_number, path: ['second_sitting_exam_number'], message: "Second sitting exam number is required for combined results" },
                { field: data.second_sitting_result, path: ['second_sitting_result'], message: "Second sitting result file is required for combined results" },
            ];

            secondSittingChecks.forEach(({ field, path, message }) => {
                if (typeof field === 'string') {
                    if (!field || field.trim() === '') {
                        ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
                    }
                } else if (!field) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
                }
            });
        }
    }
}


// Type exports
export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type BusinessApplication = z.infer<typeof businessSchoolSchema>;
export type ODLApplication = z.infer<typeof odlProgramSchema>;



// EDITING THE FIELDS
//  Schema for personal info chunk
// export const personalInfoSchema = baseSignupSchema.pick({
//     email: true,
//     phone_number: true,
//     nationality: true,
//     gender: true,
// }).extend({
//     userId: baseSignupSchema.shape.id
// });
// export const personalInfoSchema2 = baseApplicationSchema.pick({
//     id: true,
//     lga: true,
//     dob: true,
//     hometown: true,
//     hometown_address: true,
//     contact_address: true,
//     religion: true,
// });
// export const completePersonalInfoSchema = personalInfoSchema.merge(personalInfoSchema2);
// export type PersonalInfoData = z.infer<typeof completePersonalInfoSchema>;


export interface ApplicationDetailsType extends UserInterface {
    application: ApplicationFormData;

    // Add these fields that come from the API response
    academic_session?: string;
    academic_semester?: string;
    status?: 'PENDING' | 'ADMITTED' | 'NOT_ADMITTED' | 'INPROGRESS';
}



// import { UserInterface } from "@/config/Types";
// import { baseSignupSchema } from "@/hooks/use-signUp-multistep-view-model";
// import z from "zod";


// // Max file size (e.g., 5MB)
// const MAX_FILE_SIZE = 5 * 1024 * 1024;
// const ACCEPTED_FILE_TYPES = [
//     // Images
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//     "image/webp",
//     // Documents
//     "application/pdf",
//     "application/msword", // .doc
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
// ];

// const fileValidation = z.instanceof(File).optional()
//     .refine(f => !f || f.size <= MAX_FILE_SIZE, {
//         message: "File must be ≤ 5MB",
//         path: ["fileSize"],
//     })
//     .refine(f => !f || ACCEPTED_FILE_TYPES.includes(f.type), {
//         message: "Unsupported file type. Only JPEG, PNG, WEBP, PDF, DOC, DOCX allowed",
//         path: ["fileType"],
//     });

// // Zod validation schema
// export const baseAdmissionSchema = z.object({
//     id: z.string().optional(),

//     // Personal Information
//     lga: z.string().min(1, 'Local Gov. Area is required'),
//     religion: z.string().min(2, 'Religion is required'),
//     dob: z.string().min(1, 'Date of birth is required'),
//     gender: z.string().min(1, 'Gender is required'),
//     hometown: z.string().min(2, 'Home town is required'),
//     hometown_address: z.string().min(2, 'Home town address is required'),
//     contact_address: z.string().min(2, 'Contact address is required'),

//     // Sponsors Information
//     has_sponsor: z.boolean().default(false),//to be changed to has_sponsor
//     sponsor_name: z.string().optional(),
//     sponsor_relationship: z.string().optional(),
//     sponsor_email: z.string().email('Invalid email address').optional(),
//     sponsor_contact_address: z.string().optional(),
//     sponsor_phone_number: z.string().optional(),

//     // next of kin
//     next_of_kin_name: z.string().min(1, "Full name is required"),
//     next_of_kin_relationship: z.string().min(1, "Relationship is required"),
//     next_of_kin_phone_number: z
//         .string()
//         .min(10, "Phone number must be at least 10 digits")
//         .max(15, "Phone number is too long"),
//     next_of_kin_address: z.string().min(1, "Address is required"),
//     next_of_kin_email: z.string().email("").optional(),
//     is_next_of_kin_primary_contact: z.boolean().default(false).optional(),
//     next_of_kin_alternate_phone_number: z
//         .string()
//         .min(10, "")
//         .max(15, "")
//         .optional(),
//     next_of_kin_occupation: z.string().optional(),
//     next_of_kin_workplace: z.string().optional(),

//     // Document Information
//     first_school_leaving: fileValidation,
//     o_level: fileValidation,
//     hnd: fileValidation,
//     degree: fileValidation,
//     degree_transcript: fileValidation,
//     other_documents: z
//         .array(z.instanceof(File))
//         .optional()
//         .refine((fls) => fls ? fls.every(f => f.size <= MAX_FILE_SIZE) : true,
//             {
//                 message: "Each file must be ≤ 5MB",
//                 path: ["fileSize"]
//             }
//         ).refine((fls) => fls ? fls.every(f => ACCEPTED_FILE_TYPES.includes(f.type)) : true,
//             {
//                 message: "Unsupported file type. Only images (JPEG, JPG, PNG, WEBP) and documents (PDF, DOC, DOCX) are allowed",
//                 path: ["fileType"]
//             }
//         ),

//     // Academic Information
//     undergraduateDegree: z.string().min(1, 'Undergraduate degree is required'),
//     university: z.string().min(2, 'University name is required'),
//     gpa: z.string()
//         .optional()
//         .refine((val) => {
//             if (!val) return true; // Allow undefined/empty values
//             const num = parseFloat(val);
//             return !isNaN(num) && num >= 0 && num <= 5.0;
//         }, 'GPA must be between 0.0 and 5.0'),
//     graduationYear: z.string().min(4, 'Graduation year is required'),

//     // Test Scores
//     gmatScore: z.string().optional(),
//     greScore: z.string().optional(),
//     toeflScore: z.string().optional(),

//     // Professional Experience
//     workExperience: z.string().optional(),
//     currentPosition: z.string().optional(),
//     company: z.string().optional(),
//     yearsOfExperience: z.string().optional(),

//     // Program Selection
//     startTerm: z.string().min(1, 'Start term is required'),
//     studyMode: z.string().min(1, 'Study mode is required'),

//     // Essays
//     personalStatement: z
//         .string()
//         .min(100, 'Personal statement must be at least 100 characters')
//         .nonempty("Personal statement is required"),
//     careerGoals: z
//         .string()
//         .min(100, 'Career goals must be at least 100 characters')
//         .nonempty("Career goals is required"),

//     // Additional Informationand terms-and-conditions
//     has_disability: z.boolean().default(false),
//     disability: z.string().optional().default("None"),
//     agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to terms and conditions'),

//     // Profile Picture
//     passport: z.instanceof(File).optional(),
//     awaiting_result: z.boolean().default(true),
// })


// export const admissionSchema = baseAdmissionSchema.superRefine((data, ctx) => {
//     validateSponsorFields(data, ctx);
// });

// type SponsorCheck = {
//     key: keyof AdmissionFormData;
//     value: string | undefined;
//     message: string;
//     minLength?: number;
//     validate?: () => boolean;
// };

// function validateSponsorFields(data: AdmissionFormData, ctx: z.RefinementCtx) {
//     // Validate disability fields if has_disability is true
//     if (data.has_disability && !data.disability) {
//         ctx.addIssue({
//             path: ['disability'],
//             code: z.ZodIssueCode.custom,
//             message: "Please describe your disability",
//         });
//     }

//     // Validate sponsor fields if has_sponsor is true
//     if (data.has_sponsor) {
//         const checks: SponsorCheck[] = [
//             {
//                 key: "sponsor_name",
//                 value: data.sponsor_name,
//                 minLength: 2,
//                 message: "Sponsor's name is required",
//             },
//             {
//                 key: "sponsor_relationship",
//                 value: data.sponsor_relationship,
//                 minLength: 2,
//                 message: "Sponsor's relationship is required",
//             },
//             // {
//             //     key: "sponsor_email",
//             //     value: data.sponsor_email,
//             //     message: "Sponsor's email is required",
//             //     validate: () => !!data.sponsor_email && /\S+@\S+\.\S+/.test(data.sponsor_email),
//             // },
//             {
//                 key: "sponsor_contact_address",
//                 value: data.sponsor_contact_address,
//                 minLength: 10,
//                 message: "Sponsor's contact address is required",
//             },
//             {
//                 key: "sponsor_phone_number",
//                 value: data.sponsor_phone_number,
//                 minLength: 10,
//                 message: "Sponsor's phone number is required",
//             },
//         ];

//         for (const { key, value, message, minLength = 1, validate } of checks) {
//             const isValid =
//                 typeof validate === "function"
//                     ? validate()
//                     : value && value.trim().length >= minLength;

//             if (!isValid) {
//                 ctx.addIssue({
//                     path: [key],
//                     code: z.ZodIssueCode.custom,
//                     message,
//                 });
//             }
//         }
//     }
// }


// // EDITING THE FIELDS
// //  Schema for personal info chunk
// export const personalInfoSchema = baseSignupSchema.pick({
//     email: true,
//     phone_number: true,
//     nationality: true,
// }).extend({
//     userId: baseSignupSchema.shape.id
// });
// export const personalInfoSchema2 = baseAdmissionSchema.pick({
//     id: true,
//     lga: true,
//     dob: true,
//     gender: true,
//     hometown: true,
//     hometown_address: true,
//     contact_address: true,
//     religion: true,
// });
// export const completePersonalInfoSchema = personalInfoSchema.merge(personalInfoSchema2);

// // Schema for academic info chunk
// export const academicInfoSchema = baseAdmissionSchema.pick({
//     id: true,
//     undergraduateDegree: true,
//     university: true,
//     gpa: true,
//     graduationYear: true,
//     gmatScore: true,
//     greScore: true,
//     toeflScore: true
// });
// // Schema for NextOfkin info chunk
// export const nextOfkinInfoSchema = baseAdmissionSchema.pick({
//     id: true,
//     next_of_kin_name: true,
//     next_of_kin_email: true,
//     next_of_kin_phone_number: true,
//     next_of_kin_relationship: true,
//     next_of_kin_address: true,
//     next_of_kin_occupation: true,
//     next_of_kin_workplace: true
// });
// // Schema for Sponsor info chunk
// export const sponsorInfoSchema = baseAdmissionSchema.pick({
//     id: true,
//     sponsor_name: true,
//     sponsor_email: true,
//     sponsor_phone_number: true,
//     sponsor_relationship: true,
//     sponsor_contact_address: true,
//     has_sponsor: true,
// });

// export const workExoerienceInfoSchema = baseAdmissionSchema.pick({
//     id: true,
//     workExperience: true,
//     currentPosition: true,
//     company: true,
//     yearsOfExperience: true,
// });


// export const programInfoSchema = baseSignupSchema.pick({
//     program: true,
//     program_id: true,
//     academic_session: true,
// });
// export const programInfoSchema2 = baseAdmissionSchema.pick({
//     id: true,
//     studyMode: true,
//     startTerm: true,
// });
// export const completeProgramInfoSchema = programInfoSchema.merge(programInfoSchema2);

// export const otherInfoSchema = baseAdmissionSchema.pick({
//     id: true,
//     disability: true,
// });

// export const personalStatementInfoSchema = baseAdmissionSchema.pick({
//     id: true,
//     personalStatement: true,
// });

// export const careerGoalsInfoSchema = baseAdmissionSchema.pick({
//     id: true,
//     careerGoals: true,
// });

// export const qualificationDocumentsSchema = baseAdmissionSchema.pick({
//     id: true,
//     first_school_leaving: true,
//     o_level: true,
//     hnd: true,
//     degree: true,
//     degree_transcript: true,
//     other_documents: true,
//     // images: true,
// });


// export type AdmissionFormData = z.infer<typeof admissionSchema>;
// export interface ApplicationDetailsType extends UserInterface {
//     application: AdmissionFormData;
// }

// export type PersonalInfoData = z.infer<typeof completePersonalInfoSchema>;
// export type AcademicInfoData = z.infer<typeof academicInfoSchema>;
// export type NextOfkinInfoData = z.infer<typeof nextOfkinInfoSchema>;
// export type SponsorInfoData = z.infer<typeof sponsorInfoSchema>;
// export type WorkExoerienceInfoData = z.infer<typeof workExoerienceInfoSchema>;

// export type ProgramInfoData = z.infer<typeof completeProgramInfoSchema>;
// export type OtherInfoData = z.infer<typeof otherInfoSchema>;
// export type PersonalStatementInfoData = z.infer<typeof personalStatementInfoSchema>;
// export type CareerGoalsInfoData = z.infer<typeof careerGoalsInfoSchema>;
// export type QualificationDocumentsData = z.infer<typeof qualificationDocumentsSchema>;


// // Union type for all chunks
// export type ApplicationChunk =
//     | PersonalInfoData
//     | AcademicInfoData
//     | NextOfkinInfoData
//     | SponsorInfoData
//     | WorkExoerienceInfoData
//     | ProgramInfoData
//     | OtherInfoData
//     | PersonalStatementInfoData
//     | CareerGoalsInfoData
//     | QualificationDocumentsData
