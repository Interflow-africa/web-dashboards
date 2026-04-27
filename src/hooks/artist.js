/* ─────────────────────────────────────────────────────────────────
   Artist Hooks  (React Query for artist profile & onboarding)
   ───────────────────────────────────────────────────────────────── */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { artistAPI, relevantWorksAPI } from '@/services/index';
import getApiError from '@/utils/apiError';

/* ─── Query Keys ────────────────────────────────────────────────── */
export const ARTIST_KEYS = {
  profile:     ['artist', 'profile'],
  publicProfile: (id) => ['artist', 'profile', 'public', id],
  media:       ['artist', 'media'],
  experiences: ['artist', 'experiences'],
  shareLink:   ['artist', 'shareLink'],
  publicPortfolio: (token) => ['artist', 'portfolio', 'public', token],
  disciplineOptions: (discipline) => ['artist', 'discipline-options', discipline],
};

/* ─── Profile ───────────────────────────────────────────────────── */
export const useArtistProfile = () =>
  useQuery({
    queryKey: ARTIST_KEYS.profile,
    queryFn: async () => (await artistAPI.getProfile()).data.data,
    staleTime: 5 * 60 * 1000,
  });

export const useArtistPublicProfile = (userId) =>
  useQuery({
    queryKey: ARTIST_KEYS.publicProfile(userId),
    queryFn: async () => (await artistAPI.getPublicProfile(userId)).data.data,
    enabled: Boolean(userId),
  });

export const useUploadAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => artistAPI.uploadAvatar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTIST_KEYS.profile }),
    onError: () => toast.error('Failed to upload avatar.'),
  });
};

/* ─── Onboarding Steps ──────────────────────────────────────────── */
export const useArtistStep1 = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => artistAPI.step1(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTIST_KEYS.profile }),
    onError: (e) => toast.error(getApiError(e, 'Step 1 failed.')),
  });
};

export const useArtistStep2 = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => artistAPI.step2(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTIST_KEYS.profile }),
    onError: (e) => toast.error(getApiError(e, 'Step 2 failed.')),
  });
};

export const useArtistStep3 = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => artistAPI.step3(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTIST_KEYS.profile }),
    onError: (e) => toast.error(getApiError(e, 'Step 3 failed.')),
  });
};

export const useCompleteArtistOnboarding = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => artistAPI.completeOnboarding(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTIST_KEYS.profile }),
  });
};

/* ─── Media ─────────────────────────────────────────────────────── */
export const useArtistMedia = () =>
  useQuery({
    queryKey: ARTIST_KEYS.media,
    queryFn: async () => (await artistAPI.getMedia()).data.data,
  });

export const useUploadArtistMedia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => artistAPI.uploadMedia(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTIST_KEYS.media }),
    onError: () => toast.error('Upload failed.'),
  });
};

export const useDeleteArtistMedia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pk) => artistAPI.deleteMedia(pk),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTIST_KEYS.media }),
  });
};

/* ─── Experiences ───────────────────────────────────────────────── */
export const useArtistExperiences = () =>
  useQuery({
    queryKey: ARTIST_KEYS.experiences,
    queryFn: async () => (await artistAPI.getExperiences()).data.data,
  });

export const useAddExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => artistAPI.addExperience(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTIST_KEYS.experiences }),
  });
};

export const useUpdateExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pk, data }) => artistAPI.updateExperience(pk, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTIST_KEYS.experiences }),
  });
};

export const useDeleteExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pk) => artistAPI.deleteExperience(pk),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARTIST_KEYS.experiences }),
  });
};

/* ─── Misc ──────────────────────────────────────────────────────── */
export const useDisciplineOptions = (discipline) =>
  useQuery({
    queryKey: ARTIST_KEYS.disciplineOptions(discipline),
    queryFn: async () => (await artistAPI.getDisciplineOptions(discipline)).data.data,
    enabled: Boolean(discipline),
    staleTime: 60 * 60 * 1000, // 1 hour — rarely changes
  });

export const useArtistShareLink = () =>
  useQuery({
    queryKey: ARTIST_KEYS.shareLink,
    queryFn: async () => (await artistAPI.getShareLink()).data.data,
  });

export const usePublicPortfolio = (token) =>
  useQuery({
    queryKey: ARTIST_KEYS.publicPortfolio(token),
    queryFn: async () => (await artistAPI.getPublicPortfolio(token)).data.data,
    enabled: Boolean(token),
  });

/* ─── Relevant Works ─────────────────────────────────────────────── */
export const RELEVANT_WORKS_KEYS = {
  all:    ['artist', 'relevant-works'],
  detail: (pk) => ['artist', 'relevant-works', pk],
};

export const useRelevantWorks = () => {
  return useQuery({
    queryKey: RELEVANT_WORKS_KEYS.all,
    queryFn: async () => {
      const res = await relevantWorksAPI.list();
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateRelevantWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => relevantWorksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELEVANT_WORKS_KEYS.all });
      toast.success('Work added!');
    },
    onError: (err) => toast.error(getApiError(err, 'Failed to add work.')),
  });
};

export const useUpdateRelevantWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pk, data }) => relevantWorksAPI.update(pk, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELEVANT_WORKS_KEYS.all });
      toast.success('Work updated!');
    },
    onError: (err) => toast.error(getApiError(err, 'Failed to update work.')),
  });
};

export const useDeleteRelevantWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pk) => relevantWorksAPI.delete(pk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELEVANT_WORKS_KEYS.all });
      toast.success('Work removed.');
    },
    onError: (err) => toast.error(getApiError(err, 'Failed to delete work.')),
  });
};
