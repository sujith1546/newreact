import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  try {
    const { base64, fileName, contentType } = req.body || {};

    if (!base64 || !fileName) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "Missing base64 data or fileName" }));
    }

    if (!supabaseUrl || !serviceKey) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: "Supabase service credentials not configured" }));
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Convert base64 to buffer
    const buffer = Buffer.from(base64.replace(/^data:[^;]+;base64,/, ""), "base64");

    // Upload using service role to bypass RLS
    const { error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-assets")
      .upload(fileName, buffer, {
        contentType: contentType || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: uploadError.message }));
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("portfolio-assets")
      .getPublicUrl(fileName);

    res.statusCode = 200;
    return res.end(JSON.stringify({ publicUrl: urlData.publicUrl }));
  } catch (err) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: err.message }));
  }
}
