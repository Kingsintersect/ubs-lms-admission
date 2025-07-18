"use client";

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { useDataTable } from '@/hooks/useDataTable'
import { getAdmittedApplicants } from "@/app/actions/applications";
import { ActionMenu } from "@/components/ui/datatable/ActionMenu";
import { NotebookTabs } from "lucide-react";
import { baseUrl } from "@/config";
import { StudentType } from "@/config/Types";

const basePath = `${baseUrl}/dashboard/admin/manage-admissions`;
export type StudentTableColumnsType = {
    id: string
    first_name: string
    last_name: string
    other_name: string
    email: string
    reference: string
    phone_number: string
    // is_applied: any
    // admission_status: any
    // actions: string
}
export const AdmittedStudentDataTable = () => {
    const {
        data = [],
        isLoading,
        error,
        total,
        pageIndex,
        pageSize,
        setPageIndex,
        setPageSize,
        search,
        setSearch,
        setFilter,
        setSorting,
    } = useDataTable<StudentType>({
        fetchFn: getAdmittedApplicants,
        queryKey: ["getAllAdmittedStudents"],
        initialState: {
            pageIndex: 0,
            pageSize: 10,
            sortBy: "id",
            sortOrder: "desc",
        },
    });

    const columns: ColumnDef<Record<string, unknown>, StudentType>[] = [
        // {
        //     accessorKey: "id",
        //     header: "Student ID",
        //     cell: ({ row }) => `${row.getValue("id")}`,
        // },
        {
            accessorKey: "first_name",
            header: "First Name",
            cell: ({ row }) => `${row.getValue("first_name")}`,
        },
        {
            accessorKey: "last_name",
            header: "Last Name",
            cell: ({ row }) => `${row.getValue("last_name")}`,
        },
        {
            accessorKey: "email",
            header: "Email Address",
            cell: ({ row }) => `${row.getValue("email")}`,
        },
        {
            accessorKey: "is_applied",
            header: "Application Status",
            cell: ({ row }) => (
                <Badge className="rounded-lg" variant={row.getValue("is_applied") === "1" ? "default" : "destructive"}>
                    {Boolean(row.getValue("is_applied")) ? "APPLIED" : "NOT APPLIED"}
                </Badge>
            ),
        },
        {
            accessorKey: "admission_status",
            header: "Admission Status",
            cell: ({ row }) => {
                const status = row.getValue("admission_status") as string;
                return (
                    <Badge
                        variant={
                            status === "not_admitted"
                                ? "destructive"
                                : status === "admitted" || status === "pending"
                                    ? "default"
                                    : "outline"
                        }
                        className={`font-semibold rounded-lg ${status === "admitted"
                            ? "text-white"
                            : status === "pending"
                                ? "text-cyan-500"
                                : status === "not_admitted"
                                    ? "text-red-500"
                                    : "text-WHITE-400"
                            }`}
                    >
                        {status || "Unknown"}
                    </Badge>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const student = row.original as StudentTableColumnsType;

                if (!student?.id) return null;

                return (
                    <ActionMenu
                        row={student}
                        onCopy={(id) => navigator.clipboard.writeText(id ?? "")}
                        menu={[
                            { title: "Application Details", url: `${basePath}/${student.id}`, icon: NotebookTabs },
                            // { title: "Update Record", url: `${basePath}/${student.id}/update`, icon: EditIcon },
                        ]}
                    />
                );
            },
        }

    ]

    return (
        <DataTable<Record<string, unknown>, StudentType>
            columns={columns}
            fetchedData={data as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
            error={error}
            title="Admission Management"
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalItems={total}
            onPaginationChange={(page, size) => {
                setPageIndex(page);
                setPageSize(size);
            }}
            onSortChange={(field, order) => {
                setSorting([{ id: field, desc: order === "desc" }]);
            }}
            onSearchChange={setSearch}
            onFilterChange={(updated) => {
                Object.entries(updated).forEach(([key, value]) =>
                    setFilter(key, value)
                );
            }}
            searchConfig={{
                searchableFields: ["first_name", "last_name", "othername", "email", "reference"],
                placeholder: "Search products by names, email or reference number...",
                search,
                setSearch,
            }}
            filterConfigs={[
                {
                    key: 'admission_status',
                    label: 'Admission Status',
                    options: [
                        { value: 'pending', label: 'PENDING' },
                        { value: 'admitted', label: 'ADMITTED' },
                        { value: 'not_admitted', label: 'NOT ADMITTED' }
                    ]
                },
            ]}
            getRowClickUrl={(product) => `${basePath}/${product.id}`}
            enableRowClick={true}
        />
    )
}

