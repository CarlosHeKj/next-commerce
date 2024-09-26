import { SignUp } from "@clerk/nextjs"

type SignUpPageProps = {
    searchParams: {
        redirectUrl: string;
    };
};

export default function SignUpPage({searchParams: { redirectUrl }}: SignUpPageProps){
    return (
        <section className="py-14">
            <div className="container flex mx-auto width-500 justify-center px-4">

            <SignUp  signInUrl="/sign-in" fallbackRedirectUrl={redirectUrl}/>

            </div>
        </section>
    )
}