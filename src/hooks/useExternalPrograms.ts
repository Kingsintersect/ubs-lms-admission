
import { getLmsPrograms } from '@/app/actions/externalPrograms';
import { GetListOfLocalGovInState } from '@/app/actions/server.admin';
import { useQuery } from '@tanstack/react-query';

export const useFetchLocalGovermentAreas = (state?: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['lga', state],
        queryFn: async () => {
            const { success, error } = await GetListOfLocalGovInState(state!);
            if (success) return success.data;
            if (error) throw new Error("Failed ti fetch local government areas")
        },
        enabled: options?.enabled ?? !!state,
    });
};

export const useExternalPrograms = () => {
    return useQuery({
        queryKey: ['programs'],
        queryFn: () => getLmsPrograms(0),
    });
};
