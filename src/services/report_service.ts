import { supabase } from './api/supabase_client';
import { ServiceResponse } from './auth_service';
import { CreateReportInput } from '../models/report';

export const reportService = {
  async submitReport(
    reporterId: string,
    input: CreateReportInput,
  ): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: reporterId,
        listing_id: input.listing_id ?? null,
        reported_user_id: input.reported_user_id ?? null,
        reason: input.reason,
      });
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch {
      return { data: null, error: 'Failed to submit report' };
    }
  },
};
