// app/(auth)/reset-password/page.tsx
import ResetPasswordForm from "../../_components/reset_password_form"

export default async function ResetPasswordPage({ 
    params 
}: { 
    params: Promise<{ token: string }> 
}) {
    // You MUST await params to get the token safely
    const resolvedParams = await params;
    const token = resolvedParams.token;

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4">
            {/* If token is missing here, the form gets "undefined" */}
            {token ? (
                <ResetPasswordForm token={token} />
            ) : (
                <div className="text-white">Invalid or missing token in URL.</div>
            )}
        </div>
    );
}