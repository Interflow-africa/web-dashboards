/* ─────────────────────────────────────────────────────────────────
   Opportunities & Applications Hooks
   ───────────────────────────────────────────────────────────────── */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { opportunitiesAPI, applicationsAPI } from '@/services/index';
import getApiError from '@/utils/apiError';

/* ─── Query Keys ────────────────────────────────────────────────── */
export const OPP_KEYS = {
  list:   (params) => ['opportunities', 'list', params],
  detail: (pk)     => ['opportunities', 'detail', pk],
  manage: (params) => ['opportunities', 'manage', params],
};

export const APP_KEYS = {
  mine:           ['applications', 'mine'],
  myDetail:       (pk)    => ['applications', 'mine', pk],
  orgAll:         (params) => ['applications', 'org', 'all', params],
  orgDetail:      (pk)    => ['applications', 'org', 'detail', pk],
  byOpportunity:  (oppPk) => ['applications', 'org', 'opp', oppPk],
};

/* ─── Opportunities ─────────────────────────────────────────────── */
export const useOpportunities = (params) =>
  useQuery({
    queryKey: OPP_KEYS.list(params),
    queryFn: async () => (await opportunitiesAPI.list(params)).data.data,
  });

export const useOpportunityDetail = (pk) =>
  useQuery({
    queryKey: OPP_KEYS.detail(pk),
    queryFn: async () => (await opportunitiesAPI.detail(pk)).data.data,
    enabled: Boolean(pk),
  });

export const useManagedOpportunities = (params) =>
  useQuery({
    queryKey: OPP_KEYS.manage(params),
    queryFn: async () => (await opportunitiesAPI.manage(params)).data.data,
  });

export const useCreateOpportunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => opportunitiesAPI.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['opportunities'] }); toast.success('Opportunity created!'); },
    onError: (e) => toast.error(getApiError(e, 'Could not create opportunity.')),
  });
};

export const useUpdateOpportunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pk, data }) => opportunitiesAPI.update(pk, data),
    onSuccess: (_, { pk }) => { qc.invalidateQueries({ queryKey: ['opportunities'] }); toast.success('Opportunity updated!'); },
  });
};

export const useDeleteOpportunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pk) => opportunitiesAPI.delete(pk),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['opportunities'] }); toast.success('Opportunity deleted.'); },
  });
};

export const usePublishOpportunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pk) => opportunitiesAPI.publish(pk),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['opportunities'] }); toast.success('Published!'); },
  });
};

export const useCloseOpportunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pk) => opportunitiesAPI.close(pk),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
};

/* ─── Applications ──────────────────────────────────────────────── */
export const useMyApplications = () =>
  useQuery({
    queryKey: APP_KEYS.mine,
    queryFn: async () => (await applicationsAPI.myApplications()).data.data,
  });

export const useMyApplicationDetail = (pk) =>
  useQuery({
    queryKey: APP_KEYS.myDetail(pk),
    queryFn: async () => (await applicationsAPI.myApplicationDetail(pk)).data.data,
    enabled: Boolean(pk),
  });

export const useApply = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => applicationsAPI.apply(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: APP_KEYS.mine }); toast.success('Application submitted!'); },
    onError: (e) => toast.error(getApiError(e, 'Could not submit application.')),
  });
};

export const useWithdrawApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pk) => applicationsAPI.withdraw(pk),
    onSuccess: () => { qc.invalidateQueries({ queryKey: APP_KEYS.mine }); toast.success('Application withdrawn.'); },
  });
};

export const useOrgApplications = (params) =>
  useQuery({
    queryKey: APP_KEYS.orgAll(params),
    queryFn: async () => (await applicationsAPI.orgAll(params)).data.data,
  });

export const useOrgApplicationDetail = (pk) =>
  useQuery({
    queryKey: APP_KEYS.orgDetail(pk),
    queryFn: async () => (await applicationsAPI.orgDetail(pk)).data.data,
    enabled: Boolean(pk),
  });

export const useApplicationsByOpportunity = (oppPk) =>
  useQuery({
    queryKey: APP_KEYS.byOpportunity(oppPk),
    queryFn: async () => (await applicationsAPI.orgByOpportunity(oppPk)).data.data,
    enabled: Boolean(oppPk),
  });

export const useUpdateApplicationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pk, data }) => applicationsAPI.updateStatus(pk, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
};
