import { Card } from "@/components/ui/card";
import { Application } from "@/types/application";
import { format } from "date-fns";

interface ApplicationSectionsProps {
    application: Application;
}

export function ApplicationSections({ application }: ApplicationSectionsProps) {
    const personalInfo = application.personalInfo;
    const academicInfo = application.academicInfo;
    const sponsorInfo = application.sponsorInfo;

    return (
        <div className="space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Full Name</p>
                        <p>
                            {personalInfo.firstName} {personalInfo.lastName}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Date of Birth</p>
                        <p>{format(new Date(personalInfo.dob), "MMM d, yyyy")}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Gender</p>
                        <p>{personalInfo.gender}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Religion</p>
                        <p>{personalInfo.religion}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">LGA</p>
                        <p>{personalInfo.lga}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Hometown</p>
                        <p>{personalInfo.hometown}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <p className="text-sm font-medium">Contact Address</p>
                        <p>{personalInfo.contactAddress}</p>
                    </div>
                </div>
            </Card>

            {/* Academic Information */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Undergraduate Degree</p>
                        <p>{academicInfo.undergraduateDegree}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">University</p>
                        <p>{academicInfo.university}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">GPA</p>
                        <p>{academicInfo.gpa}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Graduation Year</p>
                        <p>{academicInfo.graduationYear}</p>
                    </div>
                    {academicInfo.gmatScore && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">GMAT Score</p>
                            <p>{academicInfo.gmatScore}</p>
                        </div>
                    )}
                    {academicInfo.greScore && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">GRE Score</p>
                            <p>{academicInfo.greScore}</p>
                        </div>
                    )}
                    {academicInfo.toeflScore && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">TOEFL Score</p>
                            <p>{academicInfo.toeflScore}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Program Information */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Program Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Program</p>
                        <p>{application.program}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Study Mode</p>
                        <p>{application.studyMode}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Start Term</p>
                        <p>{application.startTerm}</p>
                    </div>
                </div>
            </Card>

            {/* Essays */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Essays</h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Personal Statement</p>
                        <p className="text-muted-foreground">{application.personalStatement}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Career Goals</p>
                        <p className="text-muted-foreground">{application.careerGoals}</p>
                    </div>
                </div>
            </Card>

            {/* Sponsor Information */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Sponsor Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Sponsor Name</p>
                        <p>{sponsorInfo.sponsorName}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Relationship</p>
                        <p>{sponsorInfo.sponsorRelationship}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Email</p>
                        <p>{sponsorInfo.sponsorEmail}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Phone Number</p>
                        <p>{sponsorInfo.sponsorPhoneNumber}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <p className="text-sm font-medium">Contact Address</p>
                        <p>{sponsorInfo.sponsorContactAddress}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}