import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const merchantId = formData.get("merchant_id") as string;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!merchantId) {
    return NextResponse.json({ error: "Merchant ID required." }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Only PDF and Word documents are allowed." }, { status: 400 });
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File size exceeds 10MB limit." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    
    // Upload to Supabase Storage
    const fileName = `${merchantId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await admin.storage
      .from("supplier-documents")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = admin.storage
      .from("supplier-documents")
      .getPublicUrl(fileName);

    // Update merchant profile with document URL
    const { error: updateError } = await admin
      .from("merchant_profiles")
      .update({
        supplier_profile_document_url: publicUrl,
        supplier_profile_document_status: "uploaded_and_approved",
      })
      .eq("id", merchantId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
