import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  "https://kczzuvkuubeqdokjihrm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_h32y9_S9RBKvZ1sYqPSD5A_7UY94sho";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
