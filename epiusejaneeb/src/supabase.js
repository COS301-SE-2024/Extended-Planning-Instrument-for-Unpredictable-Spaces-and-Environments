
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rgisazefakhdieigrylb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXNhemVmYWtoZGllaWdyeWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYzMTMxNTEsImV4cCI6MjAzMTg4OTE1MX0.xNhTpM5Qxz8sHW0JPFSoFaWAtI425QPoI17jofYxoFA";

export const supabase = createClient(supabaseUrl, supabaseKey);
        