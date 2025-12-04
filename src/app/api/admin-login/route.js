import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Parola tələb olunur." },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      // Server-da konfiqurasiya səhvi – env dəyişəni təyin edilməyib
      return NextResponse.json(
        {
          success: false,
          message: "Server konfiqurasiyasında problem var. Admin parol təyin edilməyib.",
        },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json(
      { success: false, message: "Yanlış parola. Lütfən yenidən cəhd edin." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Gözlənilməyən server xətası baş verdi." },
      { status: 500 }
    );
  }
}


