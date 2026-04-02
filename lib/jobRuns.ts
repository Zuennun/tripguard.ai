type SupabaseLike = any;

export async function createJobRunCompat(params: {
  supabase: SupabaseLike;
  job: string;
  status?: string;
}) {
  const payloads = [
    {
      job: params.job,
      status: params.status ?? "running",
      started_at: new Date().toISOString(),
    },
    {
      job_name: params.job,
      status: params.status ?? "running",
      started_at: new Date().toISOString(),
    },
  ];

  for (const payload of payloads) {
    const { data, error } = await params.supabase
      .from("job_runs")
      .insert(payload)
      .select("id")
      .single();

    if (!error) return data?.id ?? null;
  }

  return null;
}

export async function finishJobRunCompat(params: {
  supabase: SupabaseLike;
  id: string | null;
  status: string;
  bookingsChecked: number;
  alertsSent: number;
  foundCount: number;
  error?: string | null;
  durationMs: number;
}) {
  if (!params.id) return;

  const payloads = [
    {
      status: params.status,
      bookings_checked: params.bookingsChecked,
      alerts_sent: params.alertsSent,
      found_count: params.foundCount,
      duration_ms: params.durationMs,
      finished_at: new Date().toISOString(),
      error: params.error ?? null,
    },
    {
      status: params.status,
      bookings_checked: params.bookingsChecked,
      alerts_sent: params.alertsSent,
      duration_ms: params.durationMs,
      error: params.error ?? null,
    },
  ];

  for (const payload of payloads) {
    const { error } = await params.supabase
      .from("job_runs")
      .update(payload)
      .eq("id", params.id);

    if (!error) return;
  }
}
