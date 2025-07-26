"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, User, GraduationCap, Briefcase, FileText, CheckCircle, AlertCircle, Edit3, Save, X } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';

// Validation Schema using Zod
const applicationSchema = z.object({
    // Personal Information
    personalInfo: z.object({
        firstName: z.string().min(2, "First name must be at least 2 characters"),
        lastName: z.string().min(2, "Last name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
        dateOfBirth: z.date({
            required_error: "Date of birth is required",
        }),
        nationality: z.string().min(1, "Nationality is required"),
        address: z.string().min(10, "Address must be at least 10 characters"),
        city: z.string().min(2, "City is required"),
        country: z.string().min(2, "Country is required"),
        postalCode: z.string().min(3, "Postal code is required"),
    }),

    // Academic Background
    academicInfo: z.object({
        undergraduateDegree: z.string().min(2, "Undergraduate degree is required"),
        undergraduateInstitution: z.string().min(2, "Institution name is required"),
        undergraduateGpa: z.string().refine((val) => {
            const num = parseFloat(val);
            return num >= 0 && num <= 4.0;
        }, "GPA must be between 0.0 and 4.0"),
        graduationYear: z.string().min(4, "Graduation year is required"),
        hasGraduateDegree: z.boolean(),
        graduateDegree: z.string().optional(),
        graduateInstitution: z.string().optional(),
        graduateGpa: z.string().optional(),
    }),

    // Test Scores
    testScores: z.object({
        gmatScore: z.string().optional(),
        greScore: z.string().optional(),
        toeflScore: z.string().optional(),
        ieltsScore: z.string().optional(),
    }),

    // Professional Experience
    workExperience: z.object({
        totalYearsExperience: z.string().min(1, "Years of experience is required"),
        currentPosition: z.string().min(2, "Current position is required"),
        currentCompany: z.string().min(2, "Current company is required"),
        industry: z.string().min(2, "Industry is required"),
        managementExperience: z.boolean(),
        leadershipRoles: z.string().optional(),
    }),

    // Program Information
    programInfo: z.object({
        intendedProgram: z.enum(["mba-fulltime", "mba-parttime", "mba-executive", "masters-finance", "masters-marketing", "masters-analytics"], {
            required_error: "Please select an intended program",
        }),
        startTerm: z.enum(["fall-2024", "spring-2025", "fall-2025"], {
            required_error: "Please select a start term",
        }),
        studyMode: z.enum(["fulltime", "parttime"], {
            required_error: "Please select study mode",
        }),
        scholarshipInterest: z.boolean(),
    }),

    // Essays and Personal Statement
    essays: z.object({
        careerGoals: z.string().min(100, "Career goals essay must be at least 100 characters"),
        whyThisProgram: z.string().min(100, "Why this program essay must be at least 100 characters"),
        leadership: z.string().min(100, "Leadership essay must be at least 100 characters"),
        additionalInfo: z.string().optional(),
    }),

    // References
    references: z.array(z.object({
        name: z.string().min(2, "Reference name is required"),
        position: z.string().min(2, "Reference position is required"),
        company: z.string().min(2, "Reference company is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().min(10, "Phone number is required"),
        relationship: z.string().min(2, "Relationship is required"),
    })).min(2, "At least 2 references are required").max(3, "Maximum 3 references allowed"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

// Form Section Component (Single Responsibility Principle)
const FormSection: React.FC<{
    title: string;
    description?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    hasErrors?: boolean;
}> = ({ title, description, icon, children, isEditing, onEdit, onSave, onCancel, hasErrors }) => (
    <Card className="w-full">
        <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {icon}
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    {hasErrors && <AlertCircle className="h-5 w-5 text-red-500" />}
                </div>
                <div className="flex space-x-2">
                    {isEditing ? (
                        <>
                            <Button size="sm" onClick={onSave} className="h-8">
                                <Save className="h-4 w-4 mr-1" />
                                Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={onCancel} className="h-8">
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button size="sm" variant="outline" onClick={onEdit} className="h-8">
                            <Edit3 className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

// Form Field Components (DRY Principle)
const FormField: React.FC<{
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}> = ({ label, error, required, children }) => (
    <div className="space-y-2">
        <Label className="text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {children}
        {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
);

// Date Picker Component
// const DatePicker: React.FC<{
//     value?: Date;
//     onChange: (date: Date | undefined) => void;
//     placeholder?: string;
// }> = ({ value, onChange, placeholder = "Select date" }) => (
//     <Popover>
//         <PopoverTrigger asChild>
//             <Button variant="outline" className="w-full justify-start text-left font-normal">
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {value ? value.toLocaleDateString() : placeholder}
//             </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//             <Calendar
//                 mode="single"
//                 selected={value}
//                 onSelect={onChange}
//                 initialFocus
//             />
//         </PopoverContent>
//     </Popover>
// );

// Custom Hooks (Separation of Concerns)
const useFormSections = () => {
    const [editingSections, setEditingSections] = useState<Set<string>>(new Set());

    const startEditing = (section: string) => {
        setEditingSections(prev => new Set(prev).add(section));
    };

    const stopEditing = (section: string) => {
        setEditingSections(prev => {
            const newSet = new Set(prev);
            newSet.delete(section);
            return newSet;
        });
    };

    const isEditing = (section: string) => editingSections.has(section);

    return { startEditing, stopEditing, isEditing };
};

// Main Component
export default function UniversityBusinessSchoolForm() {
    const { startEditing, stopEditing, isEditing } = useFormSections();
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const form = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            personalInfo: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                nationality: '',
                address: '',
                city: '',
                country: '',
                postalCode: '',
            },
            academicInfo: {
                undergraduateDegree: '',
                undergraduateInstitution: '',
                undergraduateGpa: '',
                graduationYear: '',
                hasGraduateDegree: false,
            },
            testScores: {},
            workExperience: {
                totalYearsExperience: '',
                currentPosition: '',
                currentCompany: '',
                industry: '',
                managementExperience: false,
            },
            programInfo: {
                scholarshipInterest: false,
            },
            essays: {
                careerGoals: '',
                whyThisProgram: '',
                leadership: '',
            },
            references: [
                { name: '', position: '', company: '', email: '', phone: '', relationship: '' },
                { name: '', position: '', company: '', email: '', phone: '', relationship: '' },
            ],
        },
    });

    const { control, handleSubmit, formState: { errors }, watch, setValue } = form;
    const watchHasGraduateDegree = watch('academicInfo.hasGraduateDegree');

    const onSubmit = async (data: ApplicationFormData) => {
        setSubmitStatus('submitting');
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Form submitted:', data);
            setSubmitStatus('success');
        } catch (error) {
            setSubmitStatus('error');
            console.log('error', error)
        }
    };

    const handleSectionSave = (section: string) => {
        handleSubmit(() => {
            stopEditing(section);
        })();
    };

    const addReference = () => {
        const currentRefs = watch('references');
        if (currentRefs.length < 3) {
            setValue('references', [...currentRefs, { name: '', position: '', company: '', email: '', phone: '', relationship: '' }]);
        }
    };

    const removeReference = (index: number) => {
        const currentRefs = watch('references');
        if (currentRefs.length > 2) {
            setValue('references', currentRefs.filter((_, i) => i !== index));
        }
    };

    const getSectionErrors = (section: keyof typeof errors) => {
        return errors[section] ? Object.keys(errors[section] || {}).length > 0 : false;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center py-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Business School Application</h1>
                    <p className="text-lg text-gray-600">Complete your application to our prestigious business programs</p>
                    <div className="flex justify-center mt-4 space-x-2">
                        <Badge variant="secondary">MBA Programs</Badge>
                        <Badge variant="secondary">Master's Degrees</Badge>
                        <Badge variant="secondary">Executive Education</Badge>
                    </div>
                </div>

                {/* Status Alert */}
                {submitStatus === 'success' && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            Application submitted successfully! You will receive a confirmation email shortly.
                        </AlertDescription>
                    </Alert>
                )}

                {submitStatus === 'error' && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            There was an error submitting your application. Please try again.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information Section */}
                    <FormSection
                        title="Personal Information"
                        description="Basic personal and contact details"
                        icon={<User className="h-5 w-5 text-blue-600" />}
                        isEditing={isEditing('personal')}
                        onEdit={() => startEditing('personal')}
                        onSave={() => handleSectionSave('personal')}
                        onCancel={() => stopEditing('personal')}
                        hasErrors={getSectionErrors('personalInfo')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="First Name" error={errors.personalInfo?.firstName?.message} required>
                                <Controller
                                    control={control}
                                    name="personalInfo.firstName"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('personal')} placeholder="Enter first name" />
                                    )}
                                />
                            </FormField>

                            <FormField label="Last Name" error={errors.personalInfo?.lastName?.message} required>
                                <Controller
                                    control={control}
                                    name="personalInfo.lastName"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('personal')} placeholder="Enter last name" />
                                    )}
                                />
                            </FormField>

                            <FormField label="Email Address" error={errors.personalInfo?.email?.message} required>
                                <Controller
                                    control={control}
                                    name="personalInfo.email"
                                    render={({ field }) => (
                                        <Input {...field} type="email" disabled={!isEditing('personal')} placeholder="Enter email address" />
                                    )}
                                />
                            </FormField>

                            <FormField label="Phone Number" error={errors.personalInfo?.phone?.message} required>
                                <Controller
                                    control={control}
                                    name="personalInfo.phone"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('personal')} placeholder="Enter phone number" />
                                    )}
                                />
                            </FormField>

                            <FormField label="Date of Birth" error={errors.personalInfo?.dateOfBirth?.message} required>
                                <Controller
                                    control={control}
                                    name="personalInfo.dateOfBirth"
                                    render={({ field }) => (
                                        <DatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select date of birth"
                                        />
                                    )}
                                />
                            </FormField>

                            <FormField label="Nationality" error={errors.personalInfo?.nationality?.message} required>
                                <Controller
                                    control={control}
                                    name="personalInfo.nationality"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('personal')} placeholder="Enter nationality" />
                                    )}
                                />
                            </FormField>
                        </div>

                        <Separator className="my-4" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <FormField label="Address" error={errors.personalInfo?.address?.message} required>
                                    <Controller
                                        control={control}
                                        name="personalInfo.address"
                                        render={({ field }) => (
                                            <Textarea {...field} disabled={!isEditing('personal')} placeholder="Enter full address" />
                                        )}
                                    />
                                </FormField>
                            </div>

                            <FormField label="City" error={errors.personalInfo?.city?.message} required>
                                <Controller
                                    control={control}
                                    name="personalInfo.city"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('personal')} placeholder="Enter city" />
                                    )}
                                />
                            </FormField>

                            <FormField label="Country" error={errors.personalInfo?.country?.message} required>
                                <Controller
                                    control={control}
                                    name="personalInfo.country"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('personal')} placeholder="Enter country" />
                                    )}
                                />
                            </FormField>

                            <FormField label="Postal Code" error={errors.personalInfo?.postalCode?.message} required>
                                <Controller
                                    control={control}
                                    name="personalInfo.postalCode"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('personal')} placeholder="Enter postal code" />
                                    )}
                                />
                            </FormField>
                        </div>
                    </FormSection>

                    {/* Academic Background Section */}
                    <FormSection
                        title="Academic Background"
                        description="Educational qualifications and academic history"
                        icon={<GraduationCap className="h-5 w-5 text-green-600" />}
                        isEditing={isEditing('academic')}
                        onEdit={() => startEditing('academic')}
                        onSave={() => handleSectionSave('academic')}
                        onCancel={() => stopEditing('academic')}
                        hasErrors={getSectionErrors('academicInfo')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Undergraduate Degree" error={errors.academicInfo?.undergraduateDegree?.message} required>
                                <Controller
                                    control={control}
                                    name="academicInfo.undergraduateDegree"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('academic')} placeholder="e.g., Bachelor of Science in Economics" />
                                    )}
                                />
                            </FormField>

                            <FormField label="Institution" error={errors.academicInfo?.undergraduateInstitution?.message} required>
                                <Controller
                                    control={control}
                                    name="academicInfo.undergraduateInstitution"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('academic')} placeholder="University name" />
                                    )}
                                />
                            </FormField>

                            <FormField label="GPA" error={errors.academicInfo?.undergraduateGpa?.message} required>
                                <Controller
                                    control={control}
                                    name="academicInfo.undergraduateGpa"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('academic')} placeholder="e.g., 3.75" />
                                    )}
                                />
                            </FormField>

                            <FormField label="Graduation Year" error={errors.academicInfo?.graduationYear?.message} required>
                                <Controller
                                    control={control}
                                    name="academicInfo.graduationYear"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('academic')} placeholder="e.g., 2020" />
                                    )}
                                />
                            </FormField>
                        </div>

                        <div className="mt-4">
                            <Controller
                                control={control}
                                name="academicInfo.hasGraduateDegree"
                                render={({ field }) => (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="hasGraduateDegree"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!isEditing('academic')}
                                        />
                                        <Label htmlFor="hasGraduateDegree">I have a graduate degree</Label>
                                    </div>
                                )}
                            />
                        </div>

                        {watchHasGraduateDegree && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <FormField label="Graduate Degree" error={errors.academicInfo?.graduateDegree?.message}>
                                    <Controller
                                        control={control}
                                        name="academicInfo.graduateDegree"
                                        render={({ field }) => (
                                            <Input {...field} disabled={!isEditing('academic')} placeholder="e.g., Master of Science" />
                                        )}
                                    />
                                </FormField>

                                <FormField label="Graduate Institution" error={errors.academicInfo?.graduateInstitution?.message}>
                                    <Controller
                                        control={control}
                                        name="academicInfo.graduateInstitution"
                                        render={({ field }) => (
                                            <Input {...field} disabled={!isEditing('academic')} placeholder="University name" />
                                        )}
                                    />
                                </FormField>

                                <FormField label="Graduate GPA" error={errors.academicInfo?.graduateGpa?.message}>
                                    <Controller
                                        control={control}
                                        name="academicInfo.graduateGpa"
                                        render={({ field }) => (
                                            <Input {...field} disabled={!isEditing('academic')} placeholder="e.g., 3.85" />
                                        )}
                                    />
                                </FormField>
                            </div>
                        )}
                    </FormSection>

                    {/* Test Scores Section */}
                    <FormSection
                        title="Test Scores"
                        description="Standardized test scores (optional)"
                        icon={<FileText className="h-5 w-5 text-purple-600" />}
                        isEditing={isEditing('tests')}
                        onEdit={() => startEditing('tests')}
                        onSave={() => handleSectionSave('tests')}
                        onCancel={() => stopEditing('tests')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="GMAT Score">
                                <Controller
                                    control={control}
                                    name="testScores.gmatScore"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('tests')} placeholder="e.g., 720" />
                                    )}
                                />
                            </FormField>

                            <FormField label="GRE Score">
                                <Controller
                                    control={control}
                                    name="testScores.greScore"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('tests')} placeholder="e.g., 320" />
                                    )}
                                />
                            </FormField>

                            <FormField label="TOEFL Score">
                                <Controller
                                    control={control}
                                    name="testScores.toeflScore"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('tests')} placeholder="e.g., 110" />
                                    )}
                                />
                            </FormField>

                            <FormField label="IELTS Score">
                                <Controller
                                    control={control}
                                    name="testScores.ieltsScore"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('tests')} placeholder="e.g., 8.0" />
                                    )}
                                />
                            </FormField>
                        </div>
                    </FormSection>

                    {/* Professional Experience Section */}
                    <FormSection
                        title="Professional Experience"
                        description="Work experience and career background"
                        icon={<Briefcase className="h-5 w-5 text-orange-600" />}
                        isEditing={isEditing('work')}
                        onEdit={() => startEditing('work')}
                        onSave={() => handleSectionSave('work')}
                        onCancel={() => stopEditing('work')}
                        hasErrors={getSectionErrors('workExperience')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Total Years of Experience" error={errors.workExperience?.totalYearsExperience?.message} required>
                                <Controller
                                    control={control}
                                    name="workExperience.totalYearsExperience"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing('work')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select years of experience" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0-1">0-1 years</SelectItem>
                                                <SelectItem value="2-3">2-3 years</SelectItem>
                                                <SelectItem value="4-5">4-5 years</SelectItem>
                                                <SelectItem value="6-10">6-10 years</SelectItem>
                                                <SelectItem value="10+">10+ years</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>

                            <FormField label="Current Position" error={errors.workExperience?.currentPosition?.message} required>
                                <Controller
                                    control={control}
                                    name="workExperience.currentPosition"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('work')} placeholder="e.g., Senior Analyst" />
                                    )}
                                />
                            </FormField>

                            <FormField label="Current Company" error={errors.workExperience?.currentCompany?.message} required>
                                <Controller
                                    control={control}
                                    name="workExperience.currentCompany"
                                    render={({ field }) => (
                                        <Input {...field} disabled={!isEditing('work')} placeholder="Company name" />
                                    )}
                                />
                            </FormField>

                            <FormField label="Industry" error={errors.workExperience?.industry?.message} required>
                                <Controller
                                    control={control}
                                    name="workExperience.industry"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing('work')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select industry" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="technology">Technology</SelectItem>
                                                <SelectItem value="finance">Finance</SelectItem>
                                                <SelectItem value="consulting">Consulting</SelectItem>
                                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                                <SelectItem value="retail">Retail</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
                        </div>

                        <div className="mt-4">
                            <Controller
                                control={control}
                                name="workExperience.managementExperience"
                                render={({ field }) => (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="managementExperience"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!isEditing('work')}
                                        />
                                        <Label htmlFor="managementExperience">I have management experience</Label>
                                    </div>
                                )}
                            />
                        </div>

                        <div className="mt-4">
                            <FormField label="Leadership Roles (Optional)">
                                <Controller
                                    control={control}
                                    name="workExperience.leadershipRoles"
                                    render={({ field }) => (
                                        <Textarea {...field} disabled={!isEditing('work')} placeholder="Describe any leadership roles or responsibilities" />
                                    )}
                                />
                            </FormField>
                        </div>
                    </FormSection>

                    {/* Program Information Section */}
                    <FormSection
                        title="Program Information"
                        description="Select your intended program and preferences"
                        icon={<GraduationCap className="h-5 w-5 text-indigo-600" />}
                        isEditing={isEditing('program')}
                        onEdit={() => startEditing('program')}
                        onSave={() => handleSectionSave('program')}
                        onCancel={() => stopEditing('program')}
                        hasErrors={getSectionErrors('programInfo')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Intended Program" error={errors.programInfo?.intendedProgram?.message} required>
                                <Controller
                                    control={control}
                                    name="programInfo.intendedProgram"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing('program')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select program" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mba-fulltime">MBA - Full Time</SelectItem>
                                                <SelectItem value="mba-parttime">MBA - Part Time</SelectItem>
                                                <SelectItem value="mba-executive">MBA - Executive</SelectItem>
                                                <SelectItem value="masters-finance">Master's in Finance</SelectItem>
                                                <SelectItem value="masters-marketing">Master's in Marketing</SelectItem>
                                                <SelectItem value="masters-analytics">Master's in Business Analytics</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>

                            <FormField label="Start Term" error={errors.programInfo?.startTerm?.message} required>
                                <Controller
                                    control={control}
                                    name="programInfo.startTerm"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing('program')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select start term" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fall-2024">Fall 2024</SelectItem>
                                                <SelectItem value="spring-2025">Spring 2025</SelectItem>
                                                <SelectItem value="fall-2025">Fall 2025</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>

                            <FormField label="Study Mode" error={errors.programInfo?.studyMode?.message} required>
                                <Controller
                                    control={control}
                                    name="programInfo.studyMode"
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!isEditing('program')}
                                            className="flex flex-col space-y-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="fulltime" id="fulltime" />
                                                <Label htmlFor="fulltime">Full-time</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="parttime" id="parttime" />
                                                <Label htmlFor="parttime">Part-time</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </FormField>
                        </div>

                        <div className="mt-4">
                            <Controller
                                control={control}
                                name="programInfo.scholarshipInterest"
                                render={({ field }) => (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="scholarshipInterest"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!isEditing('program')}
                                        />
                                        <Label htmlFor="scholarshipInterest">I am interested in scholarship opportunities</Label>
                                    </div>
                                )}
                            />
                        </div>
                    </FormSection>

                    {/* Essays Section */}
                    <FormSection
                        title="Essays & Personal Statement"
                        description="Personal essays and statements"
                        icon={<FileText className="h-5 w-5 text-red-600" />}
                        isEditing={isEditing('essays')}
                        onEdit={() => startEditing('essays')}
                        onSave={() => handleSectionSave('essays')}
                        onCancel={() => stopEditing('essays')}
                        hasErrors={getSectionErrors('essays')}
                    >
                        <div className="space-y-6">
                            <FormField label="Career Goals" error={errors.essays?.careerGoals?.message} required>
                                <Controller
                                    control={control}
                                    name="essays.careerGoals"
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            disabled={!isEditing('essays')}
                                            placeholder="Describe your short-term and long-term career goals. How will this program help you achieve them? (Minimum 100 characters)"
                                            className="min-h-[120px]"
                                        />
                                    )}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {watch('essays.careerGoals')?.length || 0} characters
                                </p>
                            </FormField>

                            <FormField label="Why This Program" error={errors.essays?.whyThisProgram?.message} required>
                                <Controller
                                    control={control}
                                    name="essays.whyThisProgram"
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            disabled={!isEditing('essays')}
                                            placeholder="Why are you interested in this specific program? What makes it the right fit for you? (Minimum 100 characters)"
                                            className="min-h-[120px]"
                                        />
                                    )}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {watch('essays.whyThisProgram')?.length || 0} characters
                                </p>
                            </FormField>

                            <FormField label="Leadership Experience" error={errors.essays?.leadership?.message} required>
                                <Controller
                                    control={control}
                                    name="essays.leadership"
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            disabled={!isEditing('essays')}
                                            placeholder="Describe a significant leadership experience. What did you learn from it? (Minimum 100 characters)"
                                            className="min-h-[120px]"
                                        />
                                    )}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {watch('essays.leadership')?.length || 0} characters
                                </p>
                            </FormField>

                            <FormField label="Additional Information (Optional)">
                                <Controller
                                    control={control}
                                    name="essays.additionalInfo"
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            disabled={!isEditing('essays')}
                                            placeholder="Any additional information you would like to share with the admissions committee"
                                            className="min-h-[100px]"
                                        />
                                    )}
                                />
                            </FormField>
                        </div>
                    </FormSection>

                    {/* References Section */}
                    <FormSection
                        title="References"
                        description="Professional or academic references (2-3 required)"
                        icon={<User className="h-5 w-5 text-teal-600" />}
                        isEditing={isEditing('references')}
                        onEdit={() => startEditing('references')}
                        onSave={() => handleSectionSave('references')}
                        onCancel={() => stopEditing('references')}
                        hasErrors={!!errors.references}
                    >
                        <div className="space-y-6">
                            {watch('references').map((_, index) => (
                                <Card key={index} className="p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-medium">Reference {index + 1}</h4>
                                        {watch('references').length > 2 && isEditing('references') && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeReference(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Full Name" error={errors.references?.[index]?.name?.message} required>
                                            <Controller
                                                control={control}
                                                name={`references.${index}.name`}
                                                render={({ field }) => (
                                                    <Input {...field} disabled={!isEditing('references')} placeholder="Reference full name" />
                                                )}
                                            />
                                        </FormField>

                                        <FormField label="Position/Title" error={errors.references?.[index]?.position?.message} required>
                                            <Controller
                                                control={control}
                                                name={`references.${index}.position`}
                                                render={({ field }) => (
                                                    <Input {...field} disabled={!isEditing('references')} placeholder="Job title" />
                                                )}
                                            />
                                        </FormField>

                                        <FormField label="Company/Organization" error={errors.references?.[index]?.company?.message} required>
                                            <Controller
                                                control={control}
                                                name={`references.${index}.company`}
                                                render={({ field }) => (
                                                    <Input {...field} disabled={!isEditing('references')} placeholder="Company name" />
                                                )}
                                            />
                                        </FormField>

                                        <FormField label="Email" error={errors.references?.[index]?.email?.message} required>
                                            <Controller
                                                control={control}
                                                name={`references.${index}.email`}
                                                render={({ field }) => (
                                                    <Input {...field} type="email" disabled={!isEditing('references')} placeholder="Email address" />
                                                )}
                                            />
                                        </FormField>

                                        <FormField label="Phone" error={errors.references?.[index]?.phone?.message} required>
                                            <Controller
                                                control={control}
                                                name={`references.${index}.phone`}
                                                render={({ field }) => (
                                                    <Input {...field} disabled={!isEditing('references')} placeholder="Phone number" />
                                                )}
                                            />
                                        </FormField>

                                        <FormField label="Relationship" error={errors.references?.[index]?.relationship?.message} required>
                                            <Controller
                                                control={control}
                                                name={`references.${index}.relationship`}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing('references')}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select relationship" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="supervisor">Direct Supervisor</SelectItem>
                                                            <SelectItem value="manager">Manager</SelectItem>
                                                            <SelectItem value="colleague">Colleague</SelectItem>
                                                            <SelectItem value="professor">Professor</SelectItem>
                                                            <SelectItem value="mentor">Mentor</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </FormField>
                                    </div>
                                </Card>
                            ))}

                            {watch('references').length < 3 && isEditing('references') && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addReference}
                                    className="w-full border-dashed"
                                >
                                    Add Another Reference
                                </Button>
                            )}

                            {errors.references && typeof errors.references.message === 'string' && (
                                <p className="text-sm text-red-500">{errors.references.message}</p>
                            )}
                        </div>
                    </FormSection>

                    {/* Submit Section */}
                    <Card className="w-full">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="text-sm text-gray-600">
                                    Please review all sections before submitting your application.
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={submitStatus === 'submitting'}
                                    className="w-full md:w-auto px-8 py-3 text-lg"
                                >
                                    {submitStatus === 'submitting' ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            Submit Application
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-gray-500 max-w-md mx-auto">
                                    By submitting this application, you agree to our terms and conditions and privacy policy.
                                    All information provided will be kept confidential and used solely for admission purposes.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}