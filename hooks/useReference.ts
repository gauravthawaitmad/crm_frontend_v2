import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface StateOption {
  id: number;
  state_name: string;
}

interface CityOption {
  id: number;
  city_name: string;
}

interface CoUserOption {
  user_id: string;
  user_display_name: string;
  user_role: string;
}

export function useStates() {
  return useQuery<StateOption[]>({
    queryKey: ['reference', 'states'],
    queryFn: () =>
      api.get('/api/reference/states').then((r) => r.data.result as StateOption[]),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCities(stateId: number | null | undefined) {
  return useQuery<CityOption[]>({
    queryKey: ['reference', 'cities', stateId],
    queryFn: () =>
      api
        .get('/api/reference/cities', { params: { state_id: stateId } })
        .then((r) => r.data.result as CityOption[]),
    enabled: !!stateId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCOUsers() {
  return useQuery<CoUserOption[]>({
    queryKey: ['reference', 'co-users'],
    queryFn: () =>
      api.get('/api/reference/users/co').then((r) => r.data.result as CoUserOption[]),
    staleTime: 10 * 60 * 1000,
  });
}
