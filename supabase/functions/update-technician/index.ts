import { createClient } from 'jsr:@supabase/supabase-js@2';

// Updates a technician's login/profile: verifies the caller is an
// authenticated admin, then uses the service-role key (server-side only,
// never exposed to the browser) to update the Supabase Auth user
// (email/password) and the matching profile row (name/email/phone).
// Only fields present in the request body are changed. Existing passwords
// are never readable — this only ever sets a brand new one.
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client scoped to the caller's own JWT, used only to verify who is calling.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin client using the service-role key — only ever used inside this
    // trusted server function, never sent to the browser.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (profileError || callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only admins can edit technician accounts' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const technicianId = String(body.technicianId ?? '');
    if (!technicianId) {
      return new Response(JSON.stringify({ error: 'technicianId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const name = body.name !== undefined ? String(body.name).trim() : undefined;
    const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : undefined;
    const phone = body.phone !== undefined ? String(body.phone).trim() || null : undefined;
    const password = body.password !== undefined ? String(body.password) : undefined;

    if (name !== undefined && !name) {
      return new Response(JSON.stringify({ error: 'Name cannot be empty' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (email !== undefined && !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'A valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (password !== undefined && password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Make sure the target technician actually exists before touching anything.
    const { data: existingProfile, error: existingError } = await adminClient
      .from('profiles')
      .select('id, role')
      .eq('id', technicianId)
      .single();

    if (existingError || !existingProfile || existingProfile.role !== 'technician') {
      return new Response(JSON.stringify({ error: 'Technician not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (email !== undefined) {
      const { data: duplicate } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', email)
        .neq('id', technicianId)
        .maybeSingle();
      if (duplicate) {
        return new Response(JSON.stringify({ error: 'A user with this email already exists.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Update the Auth user first (email/password) — only if there's something to change.
    if (email !== undefined || password !== undefined) {
      const authUpdate: Record<string, unknown> = {};
      if (email !== undefined) {
        authUpdate.email = email;
        authUpdate.email_confirm = true;
      }
      if (password !== undefined) authUpdate.password = password;

      const { error: authError } = await adminClient.auth.admin.updateUserById(technicianId, authUpdate);
      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const profileUpdate: Record<string, unknown> = {};
    if (name !== undefined) profileUpdate.full_name = name;
    if (email !== undefined) profileUpdate.email = email;
    if (phone !== undefined) profileUpdate.phone = phone;

    let updatedProfile: { full_name: string; email: string; phone: string | null } | null = null;

    if (Object.keys(profileUpdate).length > 0) {
      const { data, error: updateError } = await adminClient
        .from('profiles')
        .update(profileUpdate)
        .eq('id', technicianId)
        .select('full_name, email, phone')
        .single();
      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      updatedProfile = data;
    } else {
      const { data } = await adminClient
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', technicianId)
        .single();
      updatedProfile = data;
    }

    return new Response(
      JSON.stringify({
        id: technicianId,
        name: updatedProfile?.full_name,
        email: updatedProfile?.email,
        phone: updatedProfile?.phone,
        role: 'technician',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
