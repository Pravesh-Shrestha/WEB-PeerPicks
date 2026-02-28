// app/(auth)/reset-password/[token]/page.tsx
import ResetPasswordForm from "../../_components/reset_password_form"

export default async function ResetPasswordPage({ 
    params 
}: { 
    params: Promise<{ token: string }> 
}) {
    const { token } = await params;

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center text-center">
                <p className="text-red-500 font-bold uppercase text-[10px] tracking-widest">Protocol Error</p>
                <p className="text-slate-500 text-xs mt-1">Security token is missing from the URL.</p>
            </div>
        );
    }

    // No extra divs here. AuthLayout handles centering and the dark background.
    return <ResetPasswordForm token={token} />;
}