import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateEvent } from "@/lib/events/validateEvent";
import { Role } from "@/lib/events/permissions";

/**
 * POST /api/events
 * Body:
 * {
 *   transactionId: string,
 *   type: string,
 *   payload: object
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { transactionId, type, payload } = body;

    if (!transactionId || !type) {
      return NextResponse.json(
        { error: "Missing transactionId or event type" },
        { status: 400 }
      );
    }

    // 2. Resolve user's role in this transaction
    const { data: person, error: roleError } = await supabase
      .from("people")
      .select("role")
      .eq("transaction_id", transactionId)
      .eq("id", user.id)
      .single();

    if (roleError || !person) {
      return NextResponse.json(
        { error: "User not a participant in this transaction" },
        { status: 403 }
      );
    }

    const actorRole = person.role as Role;

    // 3. Validate event (registry + schema + role)
    const validated = validateEvent({
      type,
      payload,
      actorRole
    });

    // 4. Insert event (append-only)
    const { data: event, error: insertError } = await supabase
      .from("events")
      .insert({
        transaction_id: transactionId,
        type: validated.type,
        actor_role: actorRole,
        actor_id: user.id,
        payload: validated.payload
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 5. Return created event
    return NextResponse.json({ event }, { status: 201 });

  } catch (err: any) {
    console.error("Event creation failed:", err);

    return NextResponse.json(
      { error: err.message || "Event creation failed" },
      { status: 500 }
    );
  }
}
