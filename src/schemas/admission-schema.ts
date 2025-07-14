import z from "zod";


// Max file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Zod validation schema
export const admissionSchema = z.object({
    // Personal Information
    lga: z.string().min(1, 'Local Gov. Area is required'),
    religion: z.string().min(2, 'Religion is required'),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
    hometown: z.string().min(2, 'Home town is required'),
    hometown_address: z.string().min(2, 'Home town address is required'),
    contact_address: z.string().min(2, 'Contact address is required'),

    // Sponsors Information
    sponsor_name: z.string().min(2, `Sponsor's name must be at least 2 characters`),
    sponsor_relationship: z.string().min(2, `Relationship with sponsor must be at least 2 characters`),
    sponsor_email: z.string().email('Invalid email address'),
    sponsor_contact_address: z.string().min(10, `Sponsor's contact address must be at least 10 characters`),
    sponsor_phone_number: z.string().min(10, `Sponsor's phone number must be at least 10 digits`),

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
    program: z.string().min(1, 'Program selection is required'),
    startTerm: z.string().min(1, 'Start term is required'),
    studyMode: z.string().min(1, 'Study mode is required'),

    // Essays
    personalStatement: z.string().min(100, 'Personal statement must be at least 100 characters'),
    careerGoals: z.string().min(100, 'Career goals must be at least 100 characters'),

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

    image_url: z.string().optional().default('/defailt-result-image.png'),
});

export type AdmissionFormData = z.infer<typeof admissionSchema>;
