import { GraduationCap, UserMinus, UserRoundX, UsersIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
    studentStat: Record<string, number>
}

export function TeacherSectionCards({ studentStat }: SectionCardsProps) {
    return (
        <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-2">
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Students</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {/* {studentStat.totalStudents ?? 0} */} 25
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xl">
                            <UsersIcon className="!h-14 !w-14 text-cyan-700" />
                        </Badge>
                    </div>
                </CardHeader>
                {/* <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending up this month <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Visitors for the last 6 months
                    </div>
                </CardFooter> */}
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Courses</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {/* {studentStat.totalAdmitted ?? 0} */} 4
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <GraduationCap className="!h-14 !w-14 text-cyan-700" />
                        </Badge>
                    </div>
                </CardHeader>
                {/* <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Down 20% this period <TrendingDownIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Acquisition needs attention
                    </div>
                </CardFooter> */}
            </Card>
           
           
        </div>
    )
}
