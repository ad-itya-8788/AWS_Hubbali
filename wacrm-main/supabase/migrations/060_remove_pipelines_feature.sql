-- Decommission Pipelines without deleting existing pipeline/deal records.
-- RLS stays enabled with no client policies, and client table grants are
-- removed so the retained tables are no longer part of the application API.
DO $$
DECLARE
  policy_row RECORD;
BEGIN
  FOR policy_row IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (ARRAY['pipelines', 'pipeline_stages', 'deals'])
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      policy_row.policyname,
      policy_row.tablename
    );
  END LOOP;
END
$$;

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.pipelines, public.pipeline_stages, public.deals
  FROM PUBLIC, anon, authenticated;

-- Existing automations that created deals are stopped before their
-- unsupported steps are removed. Their other records and deal rows remain.
UPDATE public.automations AS a
SET is_active = false
WHERE a.is_active
  AND EXISTS (
    SELECT 1
    FROM public.automation_steps AS s
    WHERE s.automation_id = a.id
      AND s.step_type = 'create_deal'
  );

DELETE FROM public.automation_steps
WHERE step_type = 'create_deal';

DROP TRIGGER IF EXISTS deals_stamp_closed_at ON public.deals;
DROP FUNCTION IF EXISTS public.stamp_deal_closed_at();

-- Keep the existing RPC for non-pipeline dashboard metrics, but make the
-- implementation that includes deal data inaccessible to application roles.
ALTER FUNCTION public.dashboard_overview(INTEGER, TEXT)
  RENAME TO dashboard_overview_legacy;

REVOKE ALL ON FUNCTION public.dashboard_overview_legacy(INTEGER, TEXT)
  FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.dashboard_overview(
  p_days INTEGER,
  p_tz TEXT DEFAULT 'UTC'
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result JSONB;
  v_series JSONB;
BEGIN
  v_result := public.dashboard_overview_legacy(p_days, p_tz);
  v_result := v_result - 'pipeline';
  v_result := jsonb_set(
    v_result,
    '{kpis}',
    (v_result->'kpis') - 'dealsWon' - 'dealsWonPrevious' - 'dealsWonValue'
  );

  SELECT COALESCE(
    jsonb_agg(series_point - 'dealsWon' ORDER BY ordinal),
    '[]'::JSONB
  )
  INTO v_series
  FROM jsonb_array_elements(v_result #> '{volume,series}')
    WITH ORDINALITY AS series(series_point, ordinal);

  v_result := jsonb_set(v_result, '{volume,series}', v_series);
  RETURN v_result;
END;
$$;

ALTER FUNCTION public.dashboard_overview(INTEGER, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.dashboard_overview(INTEGER, TEXT)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dashboard_overview(INTEGER, TEXT)
  TO authenticated;

NOTIFY pgrst, 'reload schema';
