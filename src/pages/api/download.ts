import type { APIRoute } from "astro";
import { createSupabaseClient } from "../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  const bucket = url.searchParams.get("bucket");

  if (!path || !bucket) {
    return new Response("Missing path or bucket", { status: 400 });
  }

  const supabase = createSupabaseClient(request, cookies);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Generate signed URL (valid for 60 seconds)
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60);

  if (error || !data?.signedUrl) {
    return new Response("File not found or access denied", { status: 403 });
  }

  return Response.redirect(data.signedUrl, 302);
};
