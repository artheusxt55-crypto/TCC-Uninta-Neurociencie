import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kczzuvkuubeqdokjihrm.supabase.co";

const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
