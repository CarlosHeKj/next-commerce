import { SignIn } from "@clerk/nextjs"

type SignInPageProps = {
    searchParams: {
        redirectUrl: string;
    };
};

export default function SignUpPage({searchParams: { redirectUrl }}: SignInPageProps){
    return (
        <section className="py-14">
            <div className="container flex mx-auto width-500 justify-center px-4">

            <SignIn signUpUrl="/sign-in" fallbackRedirectUrl={redirectUrl}/>

            </div>
        </section>
    )
}